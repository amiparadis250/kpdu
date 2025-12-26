const blockchainService = require('../services/blockchainService');

class VotingController {
  async registerVoter(req, res) {
    try {
      const { memberId, branchId } = req.body;
      
      if (!memberId || !branchId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Member ID and Branch ID are required' 
        });
      }

      const result = await blockchainService.registerVoter(memberId, branchId);
      
      res.json({ 
        success: result,
        message: result ? 'Voter registered successfully' : 'Voter already exists'
      });
    } catch (error) {
      console.error('Register voter error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to register voter',
        error: error.message 
      });
    }
  }

  async verifyVoter(req, res) {
    try {
      const { memberId } = req.params;
      
      const voter = await blockchainService.verifyVoter(memberId);
      
      res.json({ 
        success: !!voter,
        voter: voter || null
      });
    } catch (error) {
      console.error('Verify voter error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to verify voter',
        error: error.message 
      });
    }
  }

  async castVote(req, res) {
    try {
      const { memberId, positionId, candidateId, level } = req.body;
      
      if (!memberId || !positionId || !candidateId || !level) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }

      const voter = await blockchainService.verifyVoter(memberId);
      if (!voter) {
        return res.status(404).json({ 
          success: false, 
          message: 'Voter not found' 
        });
      }

      if ((level === 'national' && voter.hasVotedNational) || 
          (level === 'branch' && voter.hasVotedBranch)) {
        return res.status(400).json({ 
          success: false, 
          message: `Already voted for ${level} level` 
        });
      }

      const voteResult = await blockchainService.castVote(memberId, positionId, candidateId, level);
      
      if (voteResult) {
        await blockchainService.markVoted(memberId, level);
      }
      
      res.json({ 
        success: voteResult,
        message: voteResult ? 'Vote cast successfully' : 'Failed to cast vote'
      });
    } catch (error) {
      console.error('Cast vote error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to cast vote',
        error: error.message 
      });
    }
  }

  async getResults(req, res) {
    try {
      const { positionId } = req.params;
      
      const results = await blockchainService.getResults(positionId);
      
      const formattedResults = results.map(([candidateId, votes]) => ({
        candidateId,
        votes: Number(votes)
      }));
      
      res.json({ 
        success: true,
        results: formattedResults
      });
    } catch (error) {
      console.error('Get results error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get results',
        error: error.message 
      });
    }
  }

  async getVotes(req, res) {
    try {
      const { positionId } = req.params;
      
      const votes = await blockchainService.getVotes(positionId);
      
      res.json({ 
        success: true,
        votes: votes || []
      });
    } catch (error) {
      console.error('Get votes error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get votes',
        error: error.message 
      });
    }
  }
}

module.exports = new VotingController();