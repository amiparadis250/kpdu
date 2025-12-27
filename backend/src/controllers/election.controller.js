const { prisma } = require('../lib/prisma');
const blockchainService = require('../services/blockchainService');

class ElectionController {
  // Create election with blockchain integration
  async createElection(req, res) {
    try {
      const { title, description, startDate, endDate, type, branchId } = req.body;

      // Create election in database first
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

      // Create election on blockchain
      try {
        const blockchainResult = await blockchainService.createElection({
          electionId: election.id,
          title,
          electionType: type,
          branchId,
          startDate: new Date(startDate).getTime(),
          endDate: new Date(endDate).getTime()
        });

        console.log('Blockchain election created:', blockchainResult);
      } catch (blockchainError) {
        console.error('Blockchain creation failed:', blockchainError);
      }

      res.status(201).json({
        message: 'Election created successfully',
        election
      });
    } catch (error) {
      console.error('Create election error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all elections with blockchain sync
  async getElections(req, res) {
    try {
      const dbElections = await prisma.election.findMany({
        include: {
          positions: {
            include: {
              candidates: true
            }
          },
          branch: true
        },
        orderBy: { createdAt: 'desc' }
      });

      let blockchainElections = [];
      try {
        blockchainElections = await blockchainService.getAllElections();
      } catch (error) {
        console.warn('Could not fetch blockchain elections:', error.message);
      }

      res.json({
        elections: dbElections,
        blockchainSync: blockchainElections.length > 0,
        totalElections: dbElections.length
      });
    } catch (error) {
      console.error('Get elections error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get active elections from blockchain
  async getActiveElections(req, res) {
    try {
      const activeElections = await blockchainService.getActiveElections();
      
      const enrichedElections = await Promise.all(
        activeElections.map(async (blockchainElection) => {
          try {
            const dbElection = await prisma.election.findUnique({
              where: { id: blockchainElection.electionId },
              include: {
                positions: {
                  include: {
                    candidates: true
                  }
                }
              }
            });
            
            return {
              ...blockchainElection,
              positions: dbElection?.positions || [],
              description: dbElection?.description
            };
          } catch (error) {
            return blockchainElection;
          }
        })
      );

      res.json({
        activeElections: enrichedElections,
        count: enrichedElections.length
      });
    } catch (error) {
      console.error('Get active elections error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create position
  async createPosition(req, res) {
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

      res.status(201).json({
        message: 'Position created successfully',
        position
      });
    } catch (error) {
      console.error('Create position error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get positions for election
  async getPositions(req, res) {
    try {
      const { electionId } = req.params;

      const positions = await prisma.position.findMany({
        where: { electionId },
        include: {
          candidates: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  memberName: true,
                  branch: true
                }
              }
            }
          }
        },
        orderBy: { order: 'asc' }
      });

      res.json({ positions });
    } catch (error) {
      console.error('Get positions error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create candidate with blockchain voter registration
  async createCandidate(req, res) {
    try {
      const { firstName, lastName, bio, photo, positionId, userId } = req.body;

      const candidate = await prisma.candidate.create({
        data: {
          firstName,
          lastName,
          bio,
          photo,
          positionId,
          userId
        }
      });

      // Register candidate as voter on blockchain if linked to user
      if (userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: userId }
          });
          
          if (user) {
            await blockchainService.registerVoter(user.memberId, user.branch);
            console.log(`Registered candidate ${user.memberId} as blockchain voter`);
          }
        } catch (blockchainError) {
          console.error('Failed to register candidate as voter:', blockchainError);
        }
      }

      res.status(201).json({
        message: 'Candidate created successfully',
        candidate
      });
    } catch (error) {
      console.error('Create candidate error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get candidates for position
  async getCandidates(req, res) {
    try {
      const { positionId } = req.params;

      const candidates = await prisma.candidate.findMany({
        where: { 
          positionId,
          isActive: true 
        },
        include: {
          user: {
            select: {
              memberName: true,
              branch: true,
              email: true
            }
          },
          position: {
            select: {
              title: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.json({ 
        candidates,
        position: candidates[0]?.position || null,
        totalCandidates: candidates.length
      });
    } catch (error) {
      console.error('Get candidates error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get election results from blockchain
  async getResults(req, res) {
    try {
      const { electionId } = req.params;

      const blockchainResults = await blockchainService.getResults();
      const stats = await blockchainService.getElectionStats();

      const enrichedResults = await Promise.all(
        blockchainResults.map(async (result) => {
          try {
            const candidate = await prisma.candidate.findUnique({
              where: { id: result.candidateId },
              include: {
                position: {
                  select: {
                    title: true
                  }
                },
                user: {
                  select: {
                    memberName: true
                  }
                }
              }
            });

            return {
              ...result,
              candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown',
              positionTitle: candidate?.position?.title || 'Unknown Position',
              memberName: candidate?.user?.memberName
            };
          } catch (error) {
            return result;
          }
        })
      );

      res.json({
        results: enrichedResults,
        statistics: stats,
        electionId,
        timestamp: new Date().toISOString(),
        source: 'blockchain'
      });
    } catch (error) {
      console.error('Get results error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get blockchain status
  async getBlockchainStatus(req, res) {
    try {
      const status = await blockchainService.getCanisterStatus();
      res.json(status);
    } catch (error) {
      console.error('Get blockchain status error:', error);
      res.status(500).json({ 
        connected: false, 
        error: error.message 
      });
    }
  }
}

module.exports = new ElectionController();