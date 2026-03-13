import { Router } from 'express';
import {
  getAllNotebooks,
  createNotebook,
  deleteNotebook,
  getNotesByNotebook,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/notebooks', getAllNotebooks);
router.post('/notebooks', createNotebook);
router.delete('/notebooks/:id', deleteNotebook);
router.get('/:notebookId', getNotesByNotebook);
router.post('/:notebookId', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;