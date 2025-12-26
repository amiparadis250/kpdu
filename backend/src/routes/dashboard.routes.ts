import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/dashboard/member/{userId}:
 *   get:
 *     summary: Get member dashboard data (Member only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/member/:userId', 
  authenticateToken,
  requireRole(['MEMBER']),
  dashboardController.getMemberDashboard
);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data (Admin/SuperAdmin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/admin', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  dashboardController.getAdminDashboard
);

/**
 * @swagger
 * /api/dashboard/superadmin:
 *   get:
 *     summary: Get super admin dashboard data (SuperAdmin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Super admin dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/superadmin', 
  authenticateToken,
  requireRole(['SUPERUSERADMIN']),
  dashboardController.getSuperAdminDashboard
);

export default router;