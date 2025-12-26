import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

class BranchController {
  // Get all branches
  async getBranches(req: Request, res: Response): Promise<void> {
    try {
      const branches = await prisma.branchModel.findMany({
        include: {
          users: {
            select: {
              id: true,
              memberName: true,
              isActive: true,
              hasVoted: true
            }
          },
          elections: true
        },
        orderBy: { name: 'asc' }
      });

      // Calculate turnout percentage for each branch
      const branchesWithStats = branches.map(branch => {
        const totalMembers = branch.users.filter(user => user.isActive).length;
        const votedCount = branch.users.filter(user => user.isActive && user.hasVoted).length;
        const turnoutPercentage = totalMembers > 0 ? Math.round((votedCount / totalMembers) * 100) : 0;

        return {
          id: branch.id,
          name: branch.name,
          code: branch.code,
          totalMembers,
          votedCount,
          turnoutPercentage,
          isActive: branch.isActive
        };
      });

      res.json({ branches: branchesWithStats });
    } catch (error) {
      console.error('Get branches error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new branch
  async createBranch(req: Request, res: Response): Promise<void> {
    try {
      const { name, code, description } = req.body;

      const branch = await prisma.branchModel.create({
        data: {
          name,
          code,
          description,
          isActive: true
        }
      });

      res.status(201).json({ branch });
    } catch (error) {
      console.error('Create branch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update branch
  async updateBranch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, code, description, isActive } = req.body;

      const branch = await prisma.branchModel.update({
        where: { id },
        data: {
          name,
          code,
          description,
          isActive
        }
      });

      res.json({ branch });
    } catch (error) {
      console.error('Update branch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get branch statistics
  async getBranchStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await prisma.branchModel.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          _count: {
            select: {
              users: true,
              elections: true
            }
          }
        }
      });

      res.json({ stats });
    } catch (error) {
      console.error('Get branch stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new BranchController();