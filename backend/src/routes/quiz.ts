import { Router } from 'express';
import { createQuiz, getQuiz, submitQuiz, getUserDashboard } from '../controllers/quizController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.post('/generate', createQuiz);
router.get('/dashboard', getUserDashboard);
router.get('/:id', getQuiz);
router.post('/submit', submitQuiz);

export default router;