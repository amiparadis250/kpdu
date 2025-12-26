import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

class NotificationController {
  // Get notifications for user
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // For now, return sample notifications
      // In production, this would be from a notifications table
      const notifications = [
        {
          id: '1',
          title: 'Election Started',
          message: 'The KMPDU General Election 2024 has begun. Cast your vote now!',
          type: 'election',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: '2',
          title: 'Profile Updated',
          message: 'Your profile information has been successfully updated.',
          type: 'profile',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          id: '3',
          title: 'New Candidate Added',
          message: 'A new candidate has been added to the President position.',
          type: 'candidate',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        }
      ];

      res.json({ notifications });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Mark notification as read
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      // In production, this would update the notification in database
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Send notification (admin function)
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { title, message, type, recipients } = req.body;

      // In production, this would create notifications and send emails/SMS
      console.log(`Sending notification: ${title} to ${recipients.length} recipients`);

      res.json({ 
        message: 'Notification sent successfully',
        recipients: recipients.length
      });
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get system announcements
  async getAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const announcements = [
        {
          id: '1',
          title: 'KMPDU General Election 2024',
          content: 'The Kenya Medical Practitioners and Dentists Union General Election is now live. All eligible members can cast their votes.',
          priority: 'high',
          isActive: true,
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'Voting Guidelines',
          content: 'Please ensure you read the voting guidelines before casting your vote. Each member can vote once per election.',
          priority: 'medium',
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];

      res.json({ announcements });
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new NotificationController();