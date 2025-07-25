import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('ChatRoutes');

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatUser:
 *       type: object
 *       required:
 *         - userId
 *         - name
 *       properties:
 *         userId:
 *           type: string
 *           description: Unique user identifier
 *         name:
 *           type: string
 *           description: User display name
 *         image:
 *           type: string
 *           description: User avatar URL
 *         role:
 *           type: string
 *           description: User role (user, moderator, admin)
 *     
 *     ChatChannel:
 *       type: object
 *       required:
 *         - tournamentId
 *         - channelType
 *         - name
 *       properties:
 *         tournamentId:
 *           type: string
 *           description: Tournament identifier
 *         channelType:
 *           type: string
 *           enum: [tournament, general, announcements, trading]
 *           description: Type of chat channel
 *         name:
 *           type: string
 *           description: Channel display name
 *         moderators:
 *           type: array
 *           items:
 *             type: string
 *           description: List of moderator user IDs
 *     
 *     ChatMessage:
 *       type: object
 *       required:
 *         - channelId
 *         - channelType
 *         - userId
 *         - text
 *       properties:
 *         channelId:
 *           type: string
 *           description: Channel identifier
 *         channelType:
 *           type: string
 *           description: Channel type
 *         userId:
 *           type: string
 *           description: Message sender user ID
 *         text:
 *           type: string
 *           description: Message content
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *           description: Message attachments
 */

/**
 * @swagger
 * /api/chat/initialize-user:
 *   post:
 *     summary: Initialize user for chat
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatUser'
 *     responses:
 *       200:
 *         description: User initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     apiKey:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/initialize-user', ChatController.initializeUser);

/**
 * @swagger
 * /api/chat/channels:
 *   post:
 *     summary: Create a new chat channel
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatChannel'
 *     responses:
 *       201:
 *         description: Channel created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get list of available channels
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         schema:
 *           type: string
 *         description: Tournament ID to filter channels
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID for personalized channel list
 *     responses:
 *       200:
 *         description: Channels retrieved successfully
 *       500:
 *         description: Server error
 */
router.post('/channels', ChatController.createChannel);
router.get('/channels', ChatController.getChannels);

/**
 * @swagger
 * /api/chat/channels/{channelId}/join:
 *   post:
 *     summary: Join a chat channel
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Channel ID to join
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID joining the channel
 *     responses:
 *       200:
 *         description: Successfully joined channel
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/channels/:channelId/join', ChatController.joinChannel);

/**
 * @swagger
 * /api/chat/channels/{channelId}/leave:
 *   post:
 *     summary: Leave a chat channel
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Channel ID to leave
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID leaving the channel
 *     responses:
 *       200:
 *         description: Successfully left channel
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/channels/:channelId/leave', ChatController.leaveChannel);

/**
 * @swagger
 * /api/chat/channels/{channelId}/ban:
 *   post:
 *     summary: Ban or unban a user from a channel
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Channel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - moderatorId
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to ban/unban
 *               moderatorId:
 *                 type: string
 *                 description: Moderator performing the action
 *               action:
 *                 type: string
 *                 enum: [ban, unban]
 *                 description: Action to perform
 *               timeout:
 *                 type: number
 *                 description: Ban timeout in seconds (for temporary bans)
 *               reason:
 *                 type: string
 *                 description: Reason for the ban
 *     responses:
 *       200:
 *         description: Action completed successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/channels/:channelId/ban', ChatController.banUser);

/**
 * @swagger
 * /api/chat/messages:
 *   post:
 *     summary: Send a message to a channel
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatMessage'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/messages', ChatController.sendMessage);

/**
 * @swagger
 * /api/chat/history:
 *   get:
 *     summary: Get message history for a channel
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Channel ID
 *       - in: query
 *         name: channelType
 *         required: true
 *         schema:
 *           type: string
 *         description: Channel type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *         description: Number of messages to retrieve
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: Get messages before this message ID
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         description: Get messages after this message ID
 *     responses:
 *       200:
 *         description: Message history retrieved successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.get('/history', ChatController.getMessageHistory);

/**
 * @swagger
 * /api/chat/moderate:
 *   post:
 *     summary: Moderate a message (flag, delete, approve)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *               - action
 *               - moderatorId
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: Message ID to moderate
 *               action:
 *                 type: string
 *                 enum: [flag, delete, approve]
 *                 description: Moderation action
 *               reason:
 *                 type: string
 *                 description: Reason for moderation
 *               moderatorId:
 *                 type: string
 *                 description: Moderator performing the action
 *     responses:
 *       200:
 *         description: Message moderated successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/moderate', ChatController.moderateMessage);

/**
 * @swagger
 * /api/chat/search:
 *   get:
 *     summary: Search messages across channels
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: channelId
 *         schema:
 *           type: string
 *         description: Limit search to specific channel
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Limit search to specific user
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.get('/search', ChatController.searchMessages);

/**
 * @swagger
 * /api/chat/analytics:
 *   get:
 *     summary: Get chat analytics for a tournament
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d, 30d]
 *           default: 24h
 *         description: Analytics timeframe
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.get('/analytics', ChatController.getChatAnalytics);

/**
 * @swagger
 * /api/chat/health:
 *   get:
 *     summary: Health check for chat service
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Chat service is healthy
 *       503:
 *         description: Chat service is unhealthy
 */
router.get('/health', ChatController.healthCheck);

// Log route registration
logger.info('Chat routes registered successfully');

export default router;