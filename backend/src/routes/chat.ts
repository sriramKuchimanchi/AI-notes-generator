import { Router } from 'express';
import { chat } from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.post('/', chat);

export default router;