const { prisma } = require('../lib/prisma');
const blockchainService = require('../services/blockchainService');

class VoteController {
  async getBallot(req, res) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { branchRef: true }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Register voter on blockchain if not already registered
      try {
        await blockchainService.registerVoter(user.memberId, user.branch);
      } catch (error) {
        console.log('Voter registration failed or already exists:', error.message);
      }

      // Get active elections from blockchain
      let activeElections = [];
      try {
        activeElections = await blockchainService.getActiveElections();
      } catch (error) {
        console.warn('Could not fetch active elections from blockchain:', error.message);
      }

      // Get elections from database as fallback
      const elections = await prisma.election.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { type: 'NATIONAL' },
            { type: 'BRANCH', branchId: user.branchId }
          ]
        },
        include: {
          positions: {
            include: {
              candidates: {
                where: { isActive: true }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      });

      res.json({ 
        elections,
        activeBlockchainElections: activeElections,
        user: {
          id: user.id,
          memberName: user.memberName,
          branch: user.branch,
          hasVoted: user.hasVoted
        },
        blockchainRegistered: true
      });
    } catch (error) {
      console.error('Get ballot error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async castVote(req, res) {
    try {
      const { userId, votes } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Verify voter on blockchain
      const voter = await blockchainService.verifyVoter(user.memberId);
      if (!voter) {
        res.status(404).json({ message: 'Voter not registered on blockchain' });
        return;
      }

      // Cast votes on blockchain
      const voteResults = [];
      for (const vote of votes) {
        const { positionId, candidateId, level } = vote;
        
        try {
          const result = await blockchainService.castVote(
            user.memberId,
            user.nationalId,
            positionId,
            candidateId,
            user.branch
          );
          
          if (result.ok) {
            await blockchainService.markVoted(user.memberId, level || 'national');
            voteResults.push({ 
              positionId, 
              candidateId, 
              success: true, 
              voteId: result.ok 
            });
          } else {
            voteResults.push({ 
              positionId, 
              candidateId, 
              success: false, 
              error: result.err 
            });
          }
        } catch (error) {
          voteResults.push({ 
            positionId, 
            candidateId, 
            success: false, 
            error: error.message 
          });
        }
      }

      // Mark user as voted in database if any vote succeeded
      const successfulVotes = voteResults.filter(v => v.success);
      if (successfulVotes.length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { hasVoted: true }
        });
      }

      res.json({ 
        message: `${successfulVotes.length} votes cast successfully on blockchain`,
        results: voteResults,
        totalVotes: votes.length,
        successfulVotes: successfulVotes.length,
        timestamp: new Date().toISOString(),
        source: 'blockchain'
      });
    } catch (error) {
      console.error('Cast vote error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getVotingHistory(req, res) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Get voter status from blockchain
      let blockchainStatus = null;
      try {
        blockchainStatus = await blockchainService.verifyVoter(user.memberId);
      } catch (error) {
        console.warn('Could not fetch blockchain voter status:', error.message);
      }
      
      const history = {
        hasVoted: user.hasVoted,
        votedAt: user.lastLogin,
        blockchainStatus: blockchainStatus ? {
          hasVotedNational: blockchainStatus.hasVotedNational,
          hasVotedBranch: blockchainStatus.hasVotedBranch,
          memberId: blockchainStatus.memberId,
          branchId: blockchainStatus.branchId
        } : null,
        elections: user.hasVoted ? ['General Election 2024'] : []
      };

      res.json({ history });
    } catch (error) {
      console.error('Get voting history error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getResults(req, res) {
    try {
      const { positionId } = req.params;
      
      const results = await blockchainService.getResults();
      const stats = await blockchainService.getElectionStats();
      
      // Filter results by position if specified
      const filteredResults = positionId 
        ? results.filter(r => r.positionId === positionId)
        : results;
      
      res.json({ 
        success: true,
        results: filteredResults,
        statistics: stats,
        positionId: positionId || 'all',
        source: 'blockchain',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get results error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to get results from blockchain',
        error: error.message 
      });
    }
  }

  // Verify individual vote on blockchain
  async verifyVote(req, res) {
    try {
      const { voteId } = req.params;
      
      const vote = await blockchainService.verifyVote(voteId);
      
      if (vote) {
        res.json({
          success: true,
          vote,
          verified: vote.verified,
          source: 'blockchain'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Vote not found on blockchain'
        });
      }
    } catch (error) {
      console.error('Verify vote error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to verify vote',
        error: error.message 
      });
    }
  }
}

module.exports = new VoteController();