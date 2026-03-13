import { Router } from 'express';
import { semanticSearch } from '../controllers/searchController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.post('/', semanticSearch);

export default router;