import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

class AuditController {
  // Get audit trail
  async getAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 50, action, userId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // For now, return sample audit data
      // In production, this would be from an audit_logs table
      const auditLogs = [
        {
          id: '1',
          action: 'USER_LOGIN',
          userId: 'user123',
          userName: 'John Doe',
          details: 'User logged in successfully',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
          id: '2',
          action: 'VOTE_CAST',
          userId: 'user456',
          userName: 'Jane Smith',
          details: 'Vote cast for General Election 2024',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        },
        {
          id: '3',
          action: 'CANDIDATE_ADDED',
          userId: 'admin789',
          userName: 'Admin User',
          details: 'New candidate added: Dr. Michael Johnson for President',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: '4',
          action: 'ELECTION_CREATED',
          userId: 'admin789',
          userName: 'Admin User',
          details: 'New election created: KMPDU General Election 2024',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          id: '5',
          action: 'USER_IMPORT',
          userId: 'admin789',
          userName: 'Admin User',
          details: 'Bulk user import completed: 150 users imported',
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ];

      // Filter by action if provided
      let filteredLogs = auditLogs;
      if (action) {
        filteredLogs = auditLogs.filter(log => log.action === action);
      }
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      // Paginate
      const paginatedLogs = filteredLogs.slice(skip, skip + Number(limit));

      res.json({
        auditLogs: paginatedLogs,
        pagination: {
          total: filteredLogs.length,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(filteredLogs.length / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get audit trail error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get audit statistics
  async getAuditStats(req: Request, res: Response): Promise<void> {
    try {
      // Sample statistics
      const stats = {
        totalActions: 1250,
        todayActions: 45,
        topActions: [
          { action: 'USER_LOGIN', count: 450 },
          { action: 'VOTE_CAST', count: 320 },
          { action: 'PROFILE_UPDATE', count: 180 },
          { action: 'CANDIDATE_VIEW', count: 150 },
          { action: 'ELECTION_VIEW', count: 100 }
        ],
        recentActivity: {
          lastHour: 12,
          last24Hours: 45,
          lastWeek: 280
        }
      };

      res.json({ stats });
    } catch (error) {
      console.error('Get audit stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Log audit action (internal function)
  async logAction(action: string, userId: string, details: string, req: Request): Promise<void> {
    try {
      // In production, this would save to audit_logs table
      console.log(`AUDIT: ${action} by ${userId} - ${details}`);
      
      // Example audit log entry
      const auditEntry = {
        action,
        userId,
        details,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      };

      // Save to database in production
      // await prisma.auditLog.create({ data: auditEntry });
    } catch (error) {
      console.error('Log audit action error:', error);
    }
  }
}

export default new AuditController();