import { Request, Response } from 'express';
import fs from 'fs';
import pool from '../db';
import { extractTextFromPDF } from '../services/pdfService';
import { generateNotes, generateSummary, generateTags } from '../services/groqService';
import { generateEmbedding } from '../services/embeddingService';
import { upsertVector } from '../services/pineconeService';

export async function uploadPDF(req: Request, res: Response) {
  const filePath = req.file?.path;
  try {
    const userId = (req as any).userId;
    const { notebookId, title } = req.body;

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const notebook = await pool.query(
      'SELECT id FROM notebooks WHERE id = $1 AND user_id = $2',
      [notebookId, userId]
    );
    if (notebook.rows.length === 0) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const rawText = await extractTextFromPDF(req.file.path);

    if (!rawText || rawText.trim().length < 50) {
      res.status(400).json({ error: 'Could not extract enough text from PDF' });
      return;
    }

    const truncated = rawText.slice(0, 8000);
    const aiContent = await generateNotes(truncated);
    const summary = await generateSummary(truncated);
    const tags = await generateTags(truncated);
    const noteTitle = title || req.file.originalname.replace('.pdf', '');

    const result = await pool.query(
      'INSERT INTO notes (notebook_id, user_id, title, content, summary, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [notebookId, userId, noteTitle, aiContent, summary, tags]
    );

    const note = result.rows[0];
    const embedding = await generateEmbedding(aiContent);
    await upsertVector(note.id, embedding, {
      notebookId: String(notebookId),
      userId: String(userId),
      title: String(note.title),
      summary: String(note.summary),
    });
    await pool.query('UPDATE notes SET pinecone_id = $1 WHERE id = $2', [note.id, note.id]);

    fs.unlinkSync(req.file.path);
    res.status(201).json(note);
  } catch (error) {
    console.error('PDF upload error:', error);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: 'Failed to process PDF', details: String(error) });
  }
}