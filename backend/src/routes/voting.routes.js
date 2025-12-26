const express = require('express');
const votingController = require('../controllers/votingController');

const router = express.Router();

/**
 * @swagger
 * /api/blockchain/register:
 *   post:
 *     summary: Register voter on blockchain
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *               branchId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voter registered successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/register', votingController.registerVoter);

/**
 * @swagger
 * /api/blockchain/verify/{memberId}:
 *   get:
 *     summary: Verify voter on blockchain
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voter verification result
 *       500:
 *         description: Server error
 */
router.get('/verify/:memberId', votingController.verifyVoter);

/**
 * @swagger
 * /api/blockchain/vote:
 *   post:
 *     summary: Cast vote on blockchain
 *     tags: [Blockchain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memberId:
 *                 type: string
 *               positionId:
 *                 type: string
 *               candidateId:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [national, branch]
 *     responses:
 *       200:
 *         description: Vote cast successfully
 *       400:
 *         description: Invalid request or already voted
 *       404:
 *         description: Voter not found
 *       500:
 *         description: Server error
 */
router.post('/vote', votingController.castVote);

/**
 * @swagger
 * /api/blockchain/results/{positionId}:
 *   get:
 *     summary: Get voting results from blockchain
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voting results
 *       500:
 *         description: Server error
 */
router.get('/results/:positionId', votingController.getResults);

/**
 * @swagger
 * /api/blockchain/votes/{positionId}:
 *   get:
 *     summary: Get votes for position from blockchain
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vote details
 *       500:
 *         description: Server error
 */
router.get('/votes/:positionId', votingController.getVotes);

module.exports = router;