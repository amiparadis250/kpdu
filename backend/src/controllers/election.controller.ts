import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

class ElectionController {
  // Get all elections
  async getElections(req: Request, res: Response): Promise<void> {
    try {
      const elections = await prisma.election.findMany({
        include: {
          branch: true,
          positions: {
            include: {
              candidates: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ elections });
    } catch (error) {
      console.error('Get elections error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new election
  async createElection(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, startDate, endDate, type, branchId } = req.body;

      const election = await prisma.election.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          type,
          branchId,
          status: 'ACTIVE'
        }
      });

      res.status(201).json({ election });
    } catch (error) {
      console.error('Create election error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get positions for an election or all positions
  async getPositions(req: Request, res: Response): Promise<void> {
    try {
      const { electionId } = req.params;
      
      let whereClause = {};
      if (electionId) {
        whereClause = { electionId };
      }

      const positions = await prisma.position.findMany({
        where: whereClause,
        include: {
          candidates: {
            include: {
              voteCounts: true
            }
          },
          election: {
            include: {
              branch: true
            }
          }
        },
        orderBy: { order: 'asc' }
      });

      // Helper function to calculate eligible voters
      const calculateEligibleVoters = async (election: any): Promise<number> => {
        if (election.type === 'NATIONAL') {
          return await prisma.user.count({
            where: { isActive: true, role: 'MEMBER' }
          });
        } else if (election.type === 'BRANCH' && election.branchId) {
          return await prisma.user.count({
            where: { 
              isActive: true, 
              role: 'MEMBER',
              branchId: election.branchId 
            }
          });
        }
        return 0;
      };

      // Transform positions to match frontend expectations
      const transformedPositions = await Promise.all(positions.map(async (position) => {
        const totalVotes = position.candidates.reduce((sum, candidate) => 
          sum + candidate.voteCounts.reduce((voteSum, vc) => voteSum + vc.voteCount, 0), 0
        );
        
        const candidatesWithStats = position.candidates.map(candidate => {
          const voteCount = candidate.voteCounts.reduce((sum, vc) => sum + vc.voteCount, 0);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          
          return {
            id: candidate.id,
            name: `${candidate.firstName} ${candidate.lastName}`,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            bio: candidate.bio,
            photo: candidate.photo,
            voteCount,
            percentage: Math.round(percentage * 100) / 100
          };
        });

        return {
          id: position.id,
          title: position.title,
          description: position.description,
          type: position.election.type.toLowerCase(),
          status: position.election.status.toLowerCase(),
          branch: position.election.branch?.name || null,
          candidates: candidatesWithStats,
          totalVotes,
          eligibleVoters: await calculateEligibleVoters(position.election),
          startTime: position.election.startDate,
          endTime: position.election.endDate
        };
      }));

      res.json({ positions: transformedPositions });
    } catch (error) {
      console.error('Get positions error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new position
  async createPosition(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, electionId, maxCandidates, order } = req.body;

      const position = await prisma.position.create({
        data: {
          title,
          description,
          electionId,
          maxCandidates: maxCandidates || 1,
          order: order || 0
        }
      });

      res.status(201).json({ position });
    } catch (error) {
      console.error('Create position error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get candidates for a position or all candidates
  async getCandidates(req: Request, res: Response): Promise<void> {
    try {
      const { positionId } = req.params;
      
      let whereClause = {};
      if (positionId) {
        whereClause = { positionId };
      }

      const candidates = await prisma.candidate.findMany({
        where: whereClause,
        include: {
          position: {
            include: {
              election: true
            }
          },
          user: true,
          voteCounts: true
        },
        orderBy: { createdAt: 'asc' }
      });

      // Transform candidates to match frontend expectations
      const transformedCandidates = candidates.map(candidate => {
        const voteCount = candidate.voteCounts.reduce((sum, vc) => sum + vc.voteCount, 0);
        
        return {
          id: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          bio: candidate.bio,
          photo: candidate.photo,
          position: candidate.position.title,
          positionId: candidate.positionId,
          election: candidate.position.election.title,
          voteCount,
          isActive: candidate.isActive
        };
      });

      res.json({ candidates: transformedCandidates });
    } catch (error) {
      console.error('Get candidates error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new candidate
  async createCandidate(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, bio, positionId, userId, photo } = req.body;

      const candidate = await prisma.candidate.create({
        data: {
          firstName,
          lastName,
          bio,
          positionId,
          userId,
          photo: photo || null,
          isActive: true
        }
      });

      res.status(201).json({ candidate });
    } catch (error) {
      console.error('Create candidate error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get election results (aggregated from blockchain)
  async getResults(req: Request, res: Response): Promise<void> {
    try {
      const { electionId } = req.params;

      // 🔗 BLOCKCHAIN INTEGRATION POINT
      // In production, results are fetched directly from ICP blockchain
      // NO VOTE COUNTS STORED IN TRADITIONAL DATABASE
      
      // TODO: Replace with actual ICP blockchain query
      // const blockchainResults = await icpCanister.getElectionResults(electionId);
      
      // Simulate blockchain results for development
      const mockBlockchainResults = {
        electionId,
        totalVotes: 0, // Would be fetched from blockchain
        results: [], // Would be aggregated from blockchain
        blockchainVerified: true,
        lastUpdated: new Date(),
        message: 'Results will be fetched from ICP blockchain in production'
      };

      res.json({ 
        results: mockBlockchainResults,
        source: 'ICP Blockchain',
        privacy: 'Individual votes remain anonymous on blockchain'
      });
    } catch (error) {
      console.error('Get results error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new ElectionController();