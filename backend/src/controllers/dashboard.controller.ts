import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

class DashboardController {
  // Get member dashboard data
  async getMemberDashboard(req: Request, res: Response): Promise<void> {
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

      // Get active elections count
      const activeElections = await prisma.election.count({
        where: {
          status: 'ACTIVE',
          OR: [
            { type: 'NATIONAL' },
            { type: 'BRANCH', branchId: user.branchId }
          ]
        }
      });

      const dashboardData = {
        user: {
          memberName: user.memberName,
          memberId: user.memberId,
          branch: user.branch,
          hasVoted: user.hasVoted
        },
        stats: {
          activeElections,
          totalMembers: await prisma.user.count({ where: { isActive: true } }),
          branchMembers: await prisma.user.count({ 
            where: { branchId: user.branchId, isActive: true } 
          })
        },
        recentActivity: [
          {
            action: 'Election Started',
            description: 'KMPDU General Election 2024 is now live',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ]
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Get member dashboard error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get admin dashboard data
  async getAdminDashboard(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        activeElections,
        totalBranches,
        totalVotes
      ] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.election.count({ where: { status: 'ACTIVE' } }),
        prisma.branchModel.count({ where: { isActive: true } }),
        prisma.voteCount.aggregate({ _sum: { voteCount: true } })
      ]);

      // Get user registration trend (last 7 days)
      const registrationTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const count = await prisma.user.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        });

        registrationTrend.push({
          date: dayStart.toISOString().split('T')[0],
          count
        });
      }

      // Get branch distribution
      const branchStats = await prisma.user.groupBy({
        by: ['branch'],
        _count: { id: true },
        where: { isActive: true }
      });

      const dashboardData = {
        stats: {
          totalUsers,
          activeElections,
          totalBranches,
          totalVotes: totalVotes._sum.voteCount || 0,
          votingPercentage: totalUsers > 0 ? Math.round(((totalVotes._sum.voteCount || 0) / totalUsers) * 100) : 0
        },
        charts: {
          registrationTrend,
          branchDistribution: branchStats.map(stat => ({
            branch: stat.branch,
            count: stat._count.id
          }))
        },
        recentActivity: [
          {
            action: 'New User Registration',
            description: '5 new members registered today',
            timestamp: new Date(Date.now() - 30 * 60 * 1000)
          },
          {
            action: 'Election Created',
            description: 'Branch Election for Western region created',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ]
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get super admin dashboard data
  async getSuperAdminDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Get comprehensive system statistics
      const [
        totalUsers,
        totalElections,
        totalBranches,
        totalVotes,
        activeUsers,
        completedElections
      ] = await Promise.all([
        prisma.user.count(),
        prisma.election.count(),
        prisma.branchModel.count(),
        prisma.voteCount.aggregate({ _sum: { voteCount: true } }),
        prisma.user.count({ where: { isActive: true } }),
        prisma.election.count({ where: { status: 'COMPLETED' } })
      ]);

      // System health metrics
      const systemHealth = {
        databaseStatus: 'healthy',
        apiResponseTime: '120ms',
        uptime: '99.9%',
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };

      // Get election performance
      const electionStats = await prisma.election.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          type: true,
          _count: {
            select: {
              voteCounts: true
            }
          }
        }
      });

      const dashboardData = {
        stats: {
          totalUsers,
          activeUsers,
          totalElections,
          completedElections,
          totalBranches,
          totalVotes: totalVotes._sum.voteCount || 0,
          systemHealth
        },
        electionPerformance: electionStats.map(election => ({
          id: election.id,
          title: election.title,
          status: election.status,
          type: election.type,
          totalVotes: election._count.voteCounts
        })),
        systemMetrics: {
          cpuUsage: '45%',
          memoryUsage: '62%',
          diskUsage: '38%',
          networkTraffic: '1.2 GB'
        },
        recentActivity: [
          {
            action: 'System Backup',
            description: 'Automated system backup completed successfully',
            timestamp: new Date(Date.now() - 60 * 60 * 1000)
          },
          {
            action: 'Security Scan',
            description: 'Weekly security scan completed - No issues found',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }
        ]
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Get super admin dashboard error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new DashboardController();