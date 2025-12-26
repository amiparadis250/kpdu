import { Router } from 'express';
import { body } from 'express-validator';
import electionController from '../controllers/election.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/elections:
 *   get:
 *     summary: Get all elections (All authenticated users)
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Elections retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', 
  authenticateToken,
  electionController.getElections
);

/**
 * @swagger
 * /api/elections:
 *   post:
 *     summary: Create new election (Admin/SuperAdmin only)
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum: [NATIONAL, BRANCH]
 *               branchId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Election created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('type').isIn(['NATIONAL', 'BRANCH']).withMessage('Type must be NATIONAL or BRANCH')
  ], 
  validateRequest, 
  electionController.createElection
);

// Positions
/**
 * @swagger
 * /api/elections/positions:
 *   get:
 *     summary: Get all positions (All authenticated users)
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 */
router.get('/positions', 
  authenticateToken,
  electionController.getPositions
);

/**
 * @swagger
 * /api/elections/{electionId}/positions:
 *   get:
 *     summary: Get positions for election (All authenticated users)
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:electionId/positions', 
  authenticateToken,
  electionController.getPositions
);

/**
 * @swagger
 * /api/elections/positions:
 *   post:
 *     summary: Create new position (Admin/SuperAdmin only)
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 */
router.post('/positions', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('electionId').notEmpty().withMessage('Election ID is required')
  ], 
  validateRequest, 
  electionController.createPosition
);

// Candidates
/**
 * @swagger
 * /api/elections/candidates:
 *   get:
 *     summary: Get all candidates (All authenticated users)
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 */
router.get('/candidates', 
  authenticateToken,
  electionController.getCandidates
);

/**
 * @swagger
 * /api/elections/positions/{positionId}/candidates:
 *   get:
 *     summary: Get candidates for position (All authenticated users)
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 */
router.get('/positions/:positionId/candidates', 
  authenticateToken,
  electionController.getCandidates
);

/**
 * @swagger
 * /api/elections/candidates:
 *   post:
 *     summary: Add new candidate (Admin/SuperAdmin only)
 *     tags: [Elections]
 *     security:
 *       - bearerAuth: []
 */
router.post('/candidates', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('positionId').notEmpty().withMessage('Position ID is required')
  ], 
  validateRequest, 
  electionController.createCandidate
);

// Results
/**
 * @swagger
 * /api/elections/{electionId}/results:
 *   get:
 *     summary: 🔗 BLOCKCHAIN ENDPOINT - Get election results (aggregated from blockchain)
 *     tags: [🔗 Blockchain - Results]
 *     description: |
 *       **🔗 BLOCKCHAIN INTEGRATION POINT**
 *       
 *       Returns aggregated election results from blockchain:
 *       - Vote counts aggregated from ICP blockchain
 *       - No individual vote data exposed
 *       - Cryptographically verifiable results
 *       - Real-time vote tallying from blockchain
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: electionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Election results retrieved from blockchain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       candidateId:
 *                         type: string
 *                       voteCount:
 *                         type: number
 *                       blockchainVerified:
 *                         type: boolean
 *                 totalVotes:
 *                   type: number
 *                 blockchainHash:
 *                   type: string
 *                   description: Blockchain verification hash
 *       401:
 *         description: Unauthorized
 */
router.get('/:electionId/results', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  electionController.getResults
);

export default router;