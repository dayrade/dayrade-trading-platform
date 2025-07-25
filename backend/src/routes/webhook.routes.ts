import { Router } from 'express';

const router = Router();

// TODO: Implement webhook routes in Task 10
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Webhook routes - coming in Task 10' });
});

router.post('/zimtra', (req, res) => {
  res.status(501).json({ message: 'Webhook routes - coming in Task 10' });
});

router.post('/ticketsource', (req, res) => {
  res.status(501).json({ message: 'Webhook routes - coming in Task 10' });
});

export default router;