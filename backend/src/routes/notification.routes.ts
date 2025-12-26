import { Router } from 'express';
import { body } from 'express-validator';
import notificationController from '../controllers/notification.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/notifications/{userId}:
 *   get:
 *     summary: Get notifications for user (Member only - own notifications)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/:userId', 
  authenticateToken,
  requireRole(['MEMBER']),
  notificationController.getNotifications
);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read (Member only - own notifications)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 */
router.put('/:notificationId/read', 
  authenticateToken,
  requireRole(['MEMBER']),
  notificationController.markAsRead
);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send notification (Admin/SuperAdmin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/send', 
  authenticateToken,
  requireRole(['ADMIN', 'SUPERUSERADMIN']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('recipients').isArray().withMessage('Recipients must be an array')
  ], 
  validateRequest, 
  notificationController.sendNotification
);

/**
 * @swagger
 * /api/notifications/announcements:
 *   get:
 *     summary: Get system announcements (All authenticated users)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/announcements', 
  authenticateToken,
  notificationController.getAnnouncements
);

export default router;