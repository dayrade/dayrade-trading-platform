import { Router } from 'express';

const router = Router();

// TODO: Implement admin routes in Task 11
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Admin routes - coming in Task 11' });
});

router.get('/dashboard', (req, res) => {
  res.status(501).json({ message: 'Admin routes - coming in Task 11' });
});

export default router;