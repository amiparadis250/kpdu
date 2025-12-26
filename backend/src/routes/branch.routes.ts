import { Router } from 'express';
import { body } from 'express-validator';
import branchController from '../controllers/branch.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: Get all branches (All authenticated users)
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Branches retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  authenticateToken,
  branchController.getBranches
);

/**
 * @swagger
 * /api/branches:
 *   post:
 *     summary: Create new branch (SuperAdmin only)
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', 
  authenticateToken,
  requireRole(['SUPERUSERADMIN']),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('code').notEmpty().withMessage('Code is required')
  ], 
  validateRequest, 
  branchController.createBranch
);

/**
 * @swagger
 * /api/branches/{id}:
 *   put:
 *     summary: Update branch (SuperAdmin only)
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:id', 
  authenticateToken,
  requireRole(['SUPERUSERADMIN']),
  branchController.updateBranch
);

/**
 * @swagger
 * /api/branches/stats:
 *   get:
 *     summary: Get branch statistics (Admin/SuperAdmin only)
 *     tags: [Branches]
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
router.get('/stats', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  branchController.getBranchStats
);

export default router;