import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notesRoutes from './routes/notes';
import searchRoutes from './routes/search';
import chatRoutes from './routes/chat';
import authRoutes from './routes/auth';
import uploadRoutes from './services/upload';
import quizRoutes from './routes/quiz';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Notes API is running' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;