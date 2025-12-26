import { Router } from 'express';
import auditController from '../controllers/audit.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/audit/trail:
 *   get:
 *     summary: Get audit trail (Admin/SuperAdmin only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit trail retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/trail', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  auditController.getAuditTrail
);

/**
 * @swagger
 * /api/audit/stats:
 *   get:
 *     summary: Get audit statistics (SuperAdmin only)
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/stats', 
  authenticateToken,
  requireRole(['SUPERUSERADMIN']),
  auditController.getAuditStats
);

export default router;