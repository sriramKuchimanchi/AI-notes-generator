import { Request, Response } from 'express';
import pool from '../db';
import { generateEmbedding } from '../services/embeddingService';
import { upsertVector, deleteVector } from '../services/pineconeService';
import { generateNotes, generateSummary, generateTags } from '../services/groqService';

export async function getAllNotebooks(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const result = await pool.query(
      'SELECT * FROM notebooks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notebooks' });
  }
}

export async function createNotebook(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { title, description } = req.body;
    const result = await pool.query(
      'INSERT INTO notebooks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description || '', userId]
    );
    res.status(201).json(result.rows[0]);
} catch (error) {
    console.error('Create notebook error:', error);
    res.status(500).json({ error: 'Failed to create notebook', details: String(error) });
  }}

export async function deleteNotebook(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    await pool.query('DELETE FROM notebooks WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Notebook deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notebook' });
  }
}

export async function getNotesByNotebook(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { notebookId } = req.params;
    const notebook = await pool.query(
      'SELECT id FROM notebooks WHERE id = $1 AND user_id = $2',
      [notebookId, userId]
    );
    if (notebook.rows.length === 0) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const result = await pool.query(
      'SELECT * FROM notes WHERE notebook_id = $1 ORDER BY created_at DESC',
      [notebookId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
}

export async function createNote(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { notebookId } = req.params;
    const { title, content } = req.body;

    const notebook = await pool.query(
      'SELECT id FROM notebooks WHERE id = $1 AND user_id = $2',
      [notebookId, userId]
    );
    if (notebook.rows.length === 0) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const aiContent = await generateNotes(content);
    const summary = await generateSummary(content);
    const tags = await generateTags(content);

    const result = await pool.query(
      'INSERT INTO notes (notebook_id, user_id, title, content, summary, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [notebookId, userId, title, aiContent, summary, tags]
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

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note', details: String(error) });
  }
}

export async function deleteNote(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const note = await pool.query(
      'SELECT pinecone_id FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (note.rows.length === 0) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    if (note.rows[0]?.pinecone_id) {
      try {
        await deleteVector(note.rows[0].pinecone_id);
      } catch (pineconeError) {
        console.warn('Pinecone delete failed (continuing):', pineconeError);
      }
    }
    await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
}

export async function updateNote(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { title, content } = req.body;

    const existing = await pool.query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (existing.rows.length === 0) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    const note = result.rows[0];
    const embedding = await generateEmbedding(content);
    await upsertVector(note.id, embedding, {
      notebookId: String(note.notebook_id),
      userId: String(userId),
      title: String(note.title),
      summary: String(note.summary),
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
}