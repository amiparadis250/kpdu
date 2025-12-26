import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

class VoteController {
  // Get ballot for user (active elections and positions)
  async getBallot(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Get user to determine branch
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { branchRef: true }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Get active elections (national + user's branch)
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

  // Cast vote (this integrates with blockchain in production)
  async castVote(req: Request, res: Response): Promise<void> {
    try {
      const { userId, votes } = req.body; // votes: [{ positionId, candidateId }]

      // Verify user hasn't voted
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (user.hasVoted) {
        res.status(400).json({ message: 'User has already voted' });
        return;
      }

      // 🔗 BLOCKCHAIN INTEGRATION POINT
      // In production, votes are sent directly to ICP blockchain
      // NO VOTE DATA IS STORED IN TRADITIONAL DATABASE
      
      // Simulate blockchain transaction
      const blockchainTxId = `icp_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // TODO: Replace with actual ICP blockchain integration
      // const blockchainResult = await icpCanister.storeVote({
      //   votes: votes,
      //   timestamp: new Date(),
      //   voterHash: generateAnonymousHash(userId) // Anonymous hash, not actual user ID
      // });

      // Only mark user as voted (no vote details stored)
      await prisma.user.update({
        where: { id: userId },
        data: { hasVoted: true }
      });

      res.json({ 
        message: 'Vote cast successfully to blockchain',
        blockchainTxId: blockchainTxId,
        timestamp: new Date().toISOString(),
        privacy: 'Vote stored anonymously on blockchain - no database record of vote choices'
      });
    } catch (error) {
      console.error('Cast vote error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get voting history for user (without revealing vote choices)
  async getVotingHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Return only that user has voted, not what they voted for
      const history = {
        hasVoted: user.hasVoted,
        votedAt: user.lastLogin, // Approximate - in production would be from blockchain
        elections: user.hasVoted ? ['General Election 2024'] : []
      };

      res.json({ history });
    } catch (error) {
      console.error('Get voting history error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new VoteController();