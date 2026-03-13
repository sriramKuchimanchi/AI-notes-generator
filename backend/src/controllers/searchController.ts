import { Request, Response } from 'express';
import pool from '../db';
import { generateEmbedding } from '../services/embeddingService';
import { searchVectors } from '../services/pineconeService';

export async function semanticSearch(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { query, notebookId } = req.body;

    const embedding = await generateEmbedding(query);
    const matches = await searchVectors(embedding, 5);

    if (!matches || matches.length === 0) {
      res.json([]);
      return;
    }

    const ids = matches.map((m) => m.id);
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    let sqlQuery = `SELECT * FROM notes WHERE id IN (${placeholders}) AND user_id = $${ids.length + 1}`;
    const params: string[] = [...ids, userId];

    if (notebookId) {
      sqlQuery += ` AND notebook_id = $${ids.length + 2}`;
      params.push(notebookId);
    }

    const result = await pool.query(sqlQuery, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
}