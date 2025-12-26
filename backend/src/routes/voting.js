import express from 'express';
import votingController from '../controllers/votingController.js';

const router = express.Router();

router.post('/register', votingController.registerVoter);
router.get('/verify/:memberId', votingController.verifyVoter);
router.post('/vote', votingController.castVote);
router.get('/results/:positionId', votingController.getResults);
router.get('/votes/:positionId', votingController.getVotes);

export default router;