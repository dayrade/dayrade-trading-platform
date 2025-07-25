import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { TournamentService } from '../services/tournament.service';
import { authenticateUser, requireAdmin } from '../middleware/tournament.middleware';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('TournamentRoutes');
const tournamentController = TournamentController.getInstance();

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: List all tournaments
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tournaments per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by tournament status
 *       - in: query
 *         name: division
 *         schema:
 *           type: string
 *         description: Filter by tournament division
 *     responses:
 *       200:
 *         description: Tournaments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tournaments:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.get('/', tournamentController.getAllTournaments.bind(tournamentController));

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Get tournament details
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament details retrieved successfully
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', tournamentController.getTournamentById.bind(tournamentController));

/**
 * @swagger
 * /api/tournaments/{id}/participants:
 *   get:
 *     summary: Get tournament participants
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of participants per page
 *     responses:
 *       200:
 *         description: Tournament participants retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/:id/participants', tournamentController.getTournamentParticipants.bind(tournamentController));

/**
 * @swagger
 * /api/tournaments/{id}/join:
 *   post:
 *     summary: Join a tournament
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       201:
 *         description: Successfully joined tournament
 *       400:
 *         description: Bad request (already registered, tournament full, etc.)
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/join', authenticateUser, tournamentController.joinTournament.bind(tournamentController));

/**
 * @swagger
 * /api/tournaments/{id}/leaderboard:
 *   get:
 *     summary: Get tournament-specific leaderboard
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of leaderboard entries per page
 *     responses:
 *       200:
 *         description: Tournament leaderboard retrieved successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/:id/leaderboard', tournamentController.getTournamentLeaderboard.bind(tournamentController));

// Admin-only tournament management routes (keeping existing functionality)

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create a new tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const tournament = await TournamentService.createTournament(req.body);
    
    res.status(201).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    logger.error('Failed to create tournament:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create tournament'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   put:
 *     summary: Update tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const tournament = await TournamentService.updateTournament(req.params.id, req.body);
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    logger.error('Failed to update tournament:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update tournament'
    });
  }
});

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     summary: Delete tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament deleted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    await TournamentService.deleteTournament(req.params.id);
    
    res.json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete tournament:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete tournament'
    });
  }
});

// Tournament Status Management (Admin only)
router.post('/:id/start', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const tournament = await TournamentService.startTournament(req.params.id);
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    logger.error('Failed to start tournament:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start tournament'
    });
  }
});

router.post('/:id/end', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const tournament = await TournamentService.endTournament(req.params.id);
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    logger.error('Failed to end tournament:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to end tournament'
    });
  }
});

// Legacy participant management (keeping for backward compatibility)
router.post('/:id/register', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.body;
    const participant = await TournamentService.registerParticipant(req.params.id, userId);
    
    res.json({
      success: true,
      message: 'Successfully registered for tournament',
      data: participant
    });
  } catch (error) {
    logger.error('Failed to register participant:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register for tournament'
    });
  }
});

router.delete('/:id/participants/:userId', authenticateUser, requireAdmin, async (req, res) => {
  try {
    await TournamentService.unregisterParticipant(req.params.id, req.params.userId);
    
    res.json({
      success: true,
      message: 'Successfully unregistered from tournament'
    });
  } catch (error) {
    logger.error('Failed to unregister participant:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unregister from tournament'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tournament routes are healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;