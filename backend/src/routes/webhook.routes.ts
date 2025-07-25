import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

/**
 * @swagger
 * /api/webhooks/health:
 *   get:
 *     summary: Health check for webhook endpoints
 *     tags: [Webhooks]
 *     responses:
 *       200:
 *         description: Webhook endpoints are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/health', WebhookController.healthCheck);

/**
 * @swagger
 * /api/webhooks/zimtra/kyc-approved:
 *   post:
 *     summary: Handle Zimtra KYC approval webhook
 *     tags: [Webhooks, Zimtra]
 *     description: Processes KYC approval notifications from Zimtra and sends contest ticket purchase email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - email
 *               - firstName
 *               - lastName
 *               - zimtraId
 *               - kycStatus
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Dayrade user ID
 *               email:
 *                 type: string
 *                 description: User email address
 *               firstName:
 *                 type: string
 *                 description: User first name
 *               lastName:
 *                 type: string
 *                 description: User last name
 *               zimtraId:
 *                 type: string
 *                 description: Zimtra account ID
 *               kycStatus:
 *                 type: string
 *                 enum: [approved]
 *                 description: KYC verification status
 *     responses:
 *       200:
 *         description: KYC approval processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Internal server error
 */
router.post('/zimtra/kyc-approved', WebhookController.handleZimtraKYCApproval);

/**
 * @swagger
 * /api/webhooks/zimtra/simulator-created:
 *   post:
 *     summary: Handle Zimtra SIMULATOR account creation webhook
 *     tags: [Webhooks, Zimtra]
 *     description: Processes SIMULATOR account creation notifications from Zimtra and sends account ready email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - email
 *               - firstName
 *               - lastName
 *               - zimtraId
 *               - accountType
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Dayrade user ID
 *               email:
 *                 type: string
 *                 description: User email address
 *               firstName:
 *                 type: string
 *                 description: User first name
 *               lastName:
 *                 type: string
 *                 description: User last name
 *               zimtraId:
 *                 type: string
 *                 description: Zimtra trader ID
 *               accountType:
 *                 type: string
 *                 enum: [simulator]
 *                 description: Account type
 *               accountStatus:
 *                 type: string
 *                 description: Account status
 *               accountDetails:
 *                 type: object
 *                 description: Additional account details
 *     responses:
 *       200:
 *         description: SIMULATOR account creation processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     zimtraId:
 *                       type: string
 *                     accountStatus:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid webhook signature
 *       500:
 *         description: Internal server error
 */
router.post('/zimtra/simulator-created', WebhookController.handleZimtraSimulatorCreation);

// Legacy routes for backward compatibility
router.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Dayrade Webhook Endpoints',
    endpoints: {
      health: '/api/webhooks/health',
      zimtra: {
        kycApproved: '/api/webhooks/zimtra/kyc-approved',
        simulatorCreated: '/api/webhooks/zimtra/simulator-created'
      }
    }
  });
});

router.post('/zimtra', (req, res) => {
  res.status(400).json({ 
    message: 'Please use specific Zimtra webhook endpoints',
    endpoints: [
      '/api/webhooks/zimtra/kyc-approved',
      '/api/webhooks/zimtra/simulator-created'
    ]
  });
});

router.post('/ticketsource', (req, res) => {
  res.status(501).json({ message: 'TicketSource webhook routes - coming in future update' });
});

export default router;