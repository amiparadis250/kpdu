import { Request, Response } from 'express';
import excelService from '../services/excel.service';
import { prisma } from '../lib/prisma';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `voters-${Date.now()}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class UserController {
  async importVoters(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Excel file is required' });
        return;
      }

      const validation = excelService.validateExcelStructure(req.file.path);
      
      if (!validation.valid) {
        res.status(400).json({ message: 'Invalid Excel structure' });
        return;
      }

      const results = await excelService.importVoters(req.file.path);
      
      res.json({
        message: 'Import completed',
        results: {
          total: results.total,
          successful: results.success,
          failed: results.errors.length,
          errors: results.errors.slice(0, 10)
        }
      });
    } catch (error: any) {
      console.error('Import error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { branch, page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};
      if (branch) {
        whereClause.branch = branch;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          include: { branchRef: true },
          skip,
          take: Number(limit),
          orderBy: { memberName: 'asc' }
        }),
        prisma.user.count({ where: whereClause })
      ]);

      res.json({
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUsersByBranch(req: Request, res: Response): Promise<void> {
    try {
      const branchStats = await prisma.user.groupBy({
        by: ['branch'],
        _count: { id: true }
      });

      res.json({ branchStats });
    } catch (error: any) {
      console.error('Get branch stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new UserController();