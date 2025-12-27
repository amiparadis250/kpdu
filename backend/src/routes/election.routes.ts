import { Router } from 'express';
import { body } from 'express-validator';
import electionController from '../controllers/election.controller.js';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/elections/blockchain/status:
 *   get:
 *     summary: Get blockchain connection status
 *     tags: [🔗 Blockchain - System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blockchain status retrieved
 */
router.get('/blockchain/status', 
  authenticateToken,
  electionController.getBlockchainStatus
);

/**
 * @swagger
 * /api/elections/active:
 *   get:
 *     summary: Get active elections from blockchain
 *     tags: [🔗 Blockchain - Elections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active elections retrieved from blockchain
 */
router.get('/active', 
  authenticateToken,
  electionController.getActiveElections
);

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
 *     summary: Get all candidates for a specific position
 *     tags: [Elections - Candidates]
 *     description: |
 *       Retrieves all active candidates running for a specific position.
 *       Available to all authenticated users.
 *       
 *       **Returns:**
 *       - List of candidates with their details
 *       - Candidate photos and biographies
 *       - Position information
 *       - Only active candidates are returned
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "clx1234567890"
 *         description: "ID of the position to get candidates for"
 *     responses:
 *       200:
 *         description: Candidates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 candidates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "clx1111111111"
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       bio:
 *                         type: string
 *                         example: "Experienced medical practitioner with 15 years in healthcare leadership"
 *                       photo:
 *                         type: string
 *                         example: "https://example.com/photos/john-doe.jpg"
 *                       positionId:
 *                         type: string
 *                         example: "clx1234567890"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00Z"
 *                       user:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "clx0987654321"
 *                           memberName:
 *                             type: string
 *                             example: "Dr. John Doe"
 *                           branch:
 *                             type: string
 *                             example: "WESTERN"
 *                 position:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clx1234567890"
 *                     title:
 *                       type: string
 *                       example: "President"
 *                     description:
 *                       type: string
 *                       example: "Union President position"
 *                     maxCandidates:
 *                       type: integer
 *                       example: 1
 *                 totalCandidates:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Position not found
 *       500:
 *         description: Internal server error
 */
router.get('/positions/:positionId/candidates', 
  authenticateToken,
  electionController.getCandidates
);

/**
 * @swagger
 * /api/elections/candidates:
 *   post:
 *     summary: Add new candidate to election position
 *     tags: [Elections - Candidates]
 *     description: |
 *       Creates a new candidate for a specific position in an election.
 *       Only admins and super admins can add candidates.
 *       
 *       **Required Fields:**
 *       - firstName: Candidate's first name
 *       - lastName: Candidate's last name  
 *       - positionId: ID of the position they're running for
 *       
 *       **Optional Fields:**
 *       - bio: Candidate biography/description
 *       - photo: URL to candidate photo
 *       - userId: Link to existing user account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - positionId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *                 description: "Candidate's first name"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *                 description: "Candidate's last name"
 *               positionId:
 *                 type: string
 *                 example: "clx1234567890"
 *                 description: "ID of the position candidate is running for"
 *               bio:
 *                 type: string
 *                 example: "Experienced medical practitioner with 15 years in healthcare leadership"
 *                 description: "Candidate biography (optional)"
 *               photo:
 *                 type: string
 *                 example: "https://example.com/photos/john-doe.jpg"
 *                 description: "URL to candidate photo (optional)"
 *               userId:
 *                 type: string
 *                 example: "clx0987654321"
 *                 description: "Link to existing user account (optional)"
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Candidate created successfully"
 *                 candidate:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "clx1111111111"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     bio:
 *                       type: string
 *                       example: "Experienced medical practitioner..."
 *                     photo:
 *                       type: string
 *                       example: "https://example.com/photos/john-doe.jpg"
 *                     positionId:
 *                       type: string
 *                       example: "clx1234567890"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "First name is required"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "firstName"
 *                       message:
 *                         type: string
 *                         example: "First name is required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access token required"
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       404:
 *         description: Position not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Position not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
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