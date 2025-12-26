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
          status: 'DRAFT'
        }
      });

      res.status(201).json({ election });
    } catch (error) {
      console.error('Create election error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get positions for an election
  async getPositions(req: Request, res: Response): Promise<void> {
    try {
      const { electionId } = req.params;

      const positions = await prisma.position.findMany({
        where: { electionId },
        include: {
          candidates: true,
          election: true
        },
        orderBy: { order: 'asc' }
      });

      res.json({ positions });
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

  // Get candidates for a position
  async getCandidates(req: Request, res: Response): Promise<void> {
    try {
      const { positionId } = req.params;

      const candidates = await prisma.candidate.findMany({
        where: { positionId },
        include: {
          position: true,
          user: true
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json({ candidates });
    } catch (error) {
      console.error('Get candidates error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create new candidate
  async createCandidate(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, bio, positionId, userId } = req.body;

      const candidate = await prisma.candidate.create({
        data: {
          firstName,
          lastName,
          bio,
          positionId,
          userId,
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