import { Request, Response } from 'express';
import pool from '../db';
import { generateQuiz } from '../services/groqService';

export async function createQuiz(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { notebookId } = req.body;

    const notebookResult = await pool.query(
      'SELECT * FROM notebooks WHERE id = $1 AND user_id = $2',
      [notebookId, userId]
    );
    if (notebookResult.rows.length === 0) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const notebook = notebookResult.rows[0];

    const notesResult = await pool.query(
      'SELECT title, content FROM notes WHERE notebook_id = $1 AND user_id = $2',
      [notebookId, userId]
    );
    if (notesResult.rows.length === 0) {
      res.status(400).json({ error: 'No notes found in this notebook' });
      return;
    }

    const context = notesResult.rows.map((n) => `## ${n.title}\n${n.content}`).join('\n\n');
    const quizData = await generateQuiz(context, notebook.title);

    const result = await pool.query(
      'INSERT INTO quizzes (notebook_id, user_id, title, questions) VALUES ($1, $2, $3, $4) RETURNING *',
      [notebookId, userId, `${notebook.title} Quiz`, JSON.stringify(quizData.questions)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz', details: String(error) });
  }
}

export async function getQuiz(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
}

export async function submitQuiz(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { quizId, answers } = req.body;

    const quizResult = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [quizId, userId]
    );
    if (quizResult.rows.length === 0) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    const questions = quizResult.rows[0].questions;
    let score = 0;
    const total = questions.length;

    questions.forEach((q: any) => {
      const userAnswer = answers[q.id];
      if (!userAnswer && userAnswer !== false) return;

      if (q.type === 'yes_no') {
        if (userAnswer === q.correct) score++;
      } else if (q.type === 'single_select') {
        if (userAnswer === q.correct) score++;
      } else if (q.type === 'multi_select') {
        const ua = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
        const ca = Array.isArray(q.correct) ? [...q.correct].sort() : [];
        if (JSON.stringify(ua) === JSON.stringify(ca)) score++;
      } else if (q.type === 'text_input') {
        const keywords = q.correct.toLowerCase().split(' ');
        const ans = String(userAnswer).toLowerCase();
        const matched = keywords.filter((k: string) => ans.includes(k)).length;
        if (matched >= Math.ceil(keywords.length * 0.5)) score++;
      }
    });

    const percentage = Math.round((score / total) * 100 * 100) / 100;

    const attempt = await pool.query(
      'INSERT INTO quiz_attempts (quiz_id, user_id, answers, score, total, percentage) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [quizId, userId, JSON.stringify(answers), score, total, percentage]
    );

    res.json({ score, total, percentage, attemptId: attempt.rows[0].id });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
}

export async function getUserDashboard(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const attempts = await pool.query(
      `SELECT qa.*, q.title as quiz_title, n.title as notebook_title
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN notebooks n ON q.notebook_id = n.id
       WHERE qa.user_id = $1
       ORDER BY qa.completed_at DESC`,
      [userId]
    );

    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_attempts,
        ROUND(AVG(percentage), 2) as avg_score,
        MAX(percentage) as best_score,
        MIN(percentage) as lowest_score
       FROM quiz_attempts WHERE user_id = $1`,
      [userId]
    );

    res.json({
      attempts: attempts.rows,
      stats: stats.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
}