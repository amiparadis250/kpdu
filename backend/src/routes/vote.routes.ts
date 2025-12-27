import { Router } from 'express';
import { body } from 'express-validator';
import voteController from '../controllers/vote.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/votes/ballot/{userId}:
 *   get:
 *     summary: Get ballot for user (Member only)
 *     tags: [🔗 Blockchain - Voting]
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
 *         description: Ballot retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/ballot/:userId', 
  authenticateToken,
  requireRole(['MEMBER']),
  voteController.getBallot
);

/**
 * @swagger
 * /api/votes/cast:
 *   post:
 *     summary: 🔗 BLOCKCHAIN ENDPOINT - Cast vote (stored on ICP blockchain)
 *     tags: [🔗 Blockchain - Voting]
 *     description: |
 *       **🔗 BLOCKCHAIN INTEGRATION POINT**
 *       
 *       This endpoint integrates with ICP (Internet Computer Protocol) blockchain:
 *       - Individual votes are stored anonymously on blockchain
 *       - Vote immutability guaranteed by blockchain consensus
 *       - No vote-to-voter linkage maintained
 *       - Only aggregated counts stored in traditional database
 *       
 *       **Privacy Features:**
 *       - Complete vote anonymity
 *       - Cryptographic vote verification
 *       - Tamper-proof vote storage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               votes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     positionId:
 *                       type: string
 *                     candidateId:
 *                       type: string
 *                     electionId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Vote cast successfully to blockchain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 blockchainTxId:
 *                   type: string
 *                   description: ICP blockchain transaction ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/cast', 
  authenticateToken,
  requireRole(['MEMBER']),
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('votes').isArray().withMessage('Votes must be an array')
  ], 
  validateRequest, 
  voteController.castVote
);

/**
 * @swagger
 * /api/votes/history/{userId}:
 *   get:
 *     summary: 🔗 BLOCKCHAIN ENDPOINT - Get voting history (privacy-preserving)
 *     tags: [🔗 Blockchain - Voting]
 *     description: |
 *       **🔗 BLOCKCHAIN INTEGRATION POINT**
 *       
 *       Returns voting history without revealing vote choices:
 *       - Only shows that user has voted (boolean)
 *       - No individual vote choices revealed
 *       - Blockchain transaction IDs for verification
 *       - Maintains complete vote anonymity
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
 *         description: Voting history retrieved successfully (privacy-preserving)
 *       401:
 *         description: Unauthorized
 */
router.get('/history/:userId', 
  authenticateToken,
  requireRole(['MEMBER']),
  voteController.getVotingHistory
);

/**
 * @swagger
 * /api/votes/verify/{txId}:
 *   get:
 *     summary: 🔗 BLOCKCHAIN ENDPOINT - Verify vote on blockchain
 *     tags: [🔗 Blockchain - Voting]
 *     description: |
 *       **🔗 BLOCKCHAIN INTEGRATION POINT**
 *       
 *       Verify vote integrity using blockchain transaction ID:
 *       - Confirms vote exists on ICP blockchain
 *       - Validates vote has not been tampered with
 *       - Returns cryptographic proof without revealing vote content
 *     parameters:
 *       - in: path
 *         name: txId
 *         required: true
 *         schema:
 *           type: string
 *         description: ICP blockchain transaction ID
 *     responses:
 *       200:
 *         description: Vote verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                 blockHeight:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                 cryptographicProof:
 *                   type: string
 */
/**
 * @swagger
 * /api/votes/verify/{voteId}:
 *   get:
 *     summary: 🔗 BLOCKCHAIN ENDPOINT - Verify vote on blockchain
 *     tags: [🔗 Blockchain - Voting]
 *     description: |
 *       **🔗 BLOCKCHAIN INTEGRATION POINT**
 *       
 *       Verify vote integrity using blockchain vote ID:
 *       - Confirms vote exists on ICP blockchain
 *       - Validates vote has not been tampered with
 *       - Returns cryptographic proof without revealing vote content
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: voteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Blockchain vote ID
 *     responses:
 *       200:
 *         description: Vote verification successful
 *       404:
 *         description: Vote not found on blockchain
 */
router.get('/verify/:voteId', 
  authenticateToken,
  voteController.verifyVote
);

/**
 * @swagger
 * /api/votes/results/{positionId}:
 *   get:
 *     summary: 🔗 BLOCKCHAIN ENDPOINT - Get voting results from blockchain
 *     tags: [🔗 Blockchain - Results]
 *     description: |
 *       **🔗 BLOCKCHAIN INTEGRATION POINT**
 *       
 *       Get real-time voting results from ICP blockchain:
 *       - Aggregated vote counts from blockchain
 *       - Cryptographically verified results
 *       - No individual vote data exposed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Results retrieved from blockchain
 */
router.get('/results/:positionId', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  voteController.getResults
);

export default router;