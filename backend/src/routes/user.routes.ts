import { Router } from 'express';
import userController, { upload } from '../controllers/user.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/users/import:
 *   post:
 *     summary: Import users from Excel file (Admin/SuperAdmin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file with user data
 *     responses:
 *       200:
 *         description: Import completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/import', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  upload.single('file'), 
  userController.importVoters
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users with pagination (Admin/SuperAdmin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  userController.getUsers
);

/**
 * @swagger
 * /api/users/branch-stats:
 *   get:
 *     summary: Get users grouped by branch (Admin/SuperAdmin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branch statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/branch-stats', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  userController.getUsersByBranch
);

export default router;