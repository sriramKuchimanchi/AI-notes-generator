import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadPDF } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const router = Router();
router.use(authMiddleware);
router.post('/', upload.single('pdf'), uploadPDF);

export default router;