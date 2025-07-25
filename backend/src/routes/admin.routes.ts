import { Router, Request, Response } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateUser, requireAdmin } from '../middleware/tournament.middleware';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('AdminRoutes');
const adminController = new AdminController();

// Apply authentication and admin middleware to all routes
router.use(authenticateUser);
router.use(requireAdmin);

// Dashboard & Analytics
router.get('/dashboard', adminController.getDashboard.bind(adminController));
router.get('/analytics', adminController.getAnalytics.bind(adminController));

// User Management
router.get('/users', adminController.getUsers.bind(adminController));
router.get('/users/:id', adminController.getUserById.bind(adminController));
router.put('/users/:id', adminController.updateUser.bind(adminController));
router.delete('/users/:id', adminController.deleteUser.bind(adminController));
router.post('/users/:id/suspend', adminController.suspendUser.bind(adminController));
router.post('/users/:id/unsuspend', adminController.unsuspendUser.bind(adminController));

// Tournament Management
router.get('/tournaments', adminController.getTournaments.bind(adminController));
router.post('/tournaments', adminController.createTournament.bind(adminController));
router.put('/tournaments/:id', adminController.updateTournament.bind(adminController));
router.delete('/tournaments/:id', adminController.deleteTournament.bind(adminController));

// Voice Commentary Control
router.get('/voice/status', adminController.getVoiceCommentaryStatus.bind(adminController));
router.put('/voice/settings', adminController.updateVoiceCommentarySettings.bind(adminController));

// System Management
router.get('/system/health', adminController.getSystemHealth.bind(adminController));
router.get('/system/logs', adminController.getSystemLogs.bind(adminController));

// Sample Data Generation
router.post('/sample-data', adminController.generateSampleData.bind(adminController));

// Announcements
router.get('/announcements', adminController.getAnnouncements.bind(adminController));
router.post('/announcements', adminController.createAnnouncement.bind(adminController));
router.delete('/announcements/:id', adminController.deleteAnnouncement.bind(adminController));

logger.info('Admin routes registered successfully');

export default router;