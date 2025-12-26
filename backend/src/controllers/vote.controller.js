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
        await blockchainService.registerVoter(user.memberId, user.branchId);
      } catch (error) {
        console.log('Voter already registered or registration failed');
      }

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
        user: {
          id: user.id,
          memberName: user.memberName,
          branch: user.branch,
          hasVoted: user.hasVoted
        }
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
        const { positionId, candidateId } = vote;
        const level = vote.level || 'national'; // default to national
        
        const result = await blockchainService.castVote(
          user.memberId, 
          positionId, 
          candidateId, 
          level
        );
        
        if (result) {
          await blockchainService.markVoted(user.memberId, level);
          voteResults.push({ positionId, candidateId, success: true });
        } else {
          voteResults.push({ positionId, candidateId, success: false });
        }
      }

      // Mark user as voted in database
      await prisma.user.update({
        where: { id: userId },
        data: { hasVoted: true }
      });

      res.json({ 
        message: 'Votes cast successfully on blockchain',
        results: voteResults,
        timestamp: new Date().toISOString()
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
      const voter = await blockchainService.verifyVoter(user.memberId);
      
      const history = {
        hasVoted: user.hasVoted,
        votedAt: user.lastLogin,
        blockchainStatus: voter ? {
          hasVotedNational: voter.hasVotedNational,
          hasVotedBranch: voter.hasVotedBranch
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
      
      const results = await blockchainService.getResults(positionId);
      
      res.json({ 
        success: true,
        results: results.map(([candidateId, votes]) => ({
          candidateId,
          votes: Number(votes)
        }))
      });
    } catch (error) {
      console.error('Get results error:', error);
      res.status(500).json({ message: 'Failed to get results' });
    }
  }
}

module.exports = new VoteController();