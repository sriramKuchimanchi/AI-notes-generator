import { Request, Response } from 'express';
import pool from '../db';
import { generateEmbedding } from '../services/embeddingService';
import { searchVectors } from '../services/pineconeService';
import { chatWithNotes } from '../services/groqService';

export async function chat(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { question, notebookId, history } = req.body;

    const embedding = await generateEmbedding(question);
    const matches = await searchVectors(embedding, 5);

    let context = '';

    if (matches && matches.length > 0) {
      const ids = matches.map((m) => m.id);
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
      let sqlQuery = `SELECT title, content FROM notes WHERE id IN (${placeholders}) AND user_id = $${ids.length + 1}`;
      const params: string[] = [...ids, userId];

      if (notebookId) {
        sqlQuery += ` AND notebook_id = $${ids.length + 2}`;
        params.push(notebookId);
      }

      const result = await pool.query(sqlQuery, params);
      context = result.rows.map((r) => `## ${r.title}\n${r.content}`).join('\n\n');
    }

    if (!context) {
      const fallback = await pool.query(
        'SELECT title, content FROM notes WHERE notebook_id = $1 AND user_id = $2 LIMIT 3',
        [notebookId, userId]
      );
      context = fallback.rows.map((r) => `## ${r.title}\n${r.content}`).join('\n\n');
    }

    const answer = await chatWithNotes(question, context, history || []);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Chat failed' });
  }
}