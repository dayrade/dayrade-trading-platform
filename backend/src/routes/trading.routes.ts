import { Router } from 'express';

const router = Router();

// TODO: Implement trading routes in Task 08
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Trading routes - coming in Task 08' });
});

router.get('/performance', (req, res) => {
  res.status(501).json({ message: 'Trading routes - coming in Task 08' });
});

export default router;