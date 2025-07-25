import { Router } from 'express';

const router = Router();

// TODO: Implement authentication routes in Task 03
router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Authentication routes - coming in Task 03' });
});

router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Authentication routes - coming in Task 03' });
});

router.post('/logout', (req, res) => {
  res.status(501).json({ message: 'Authentication routes - coming in Task 03' });
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ message: 'Authentication routes - coming in Task 03' });
});

export default router;