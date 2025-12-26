import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/candidates/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'candidate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload candidate photo
router.post('/candidate-photo', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  upload.single('photo'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const photoUrl = `/uploads/candidates/${req.file.filename}`;
      console.log('Photo uploaded successfully:', photoUrl);
      res.json({ photoUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  }
);

export default router;