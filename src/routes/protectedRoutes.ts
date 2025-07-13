import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, (req: Request & { userId?: number }, res: Response) => {
  res.json({ message: `User ID: ${req.userId}` });
});

export default router;
