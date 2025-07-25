import { Router } from 'express';

const router = Router();

// TODO: Implement tournament routes in Task 08
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Tournament routes - coming in Task 08' });
});

export default router;