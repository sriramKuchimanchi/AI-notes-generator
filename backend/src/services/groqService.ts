import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const MODEL = 'llama-3.1-8b-instant';

export async function generateNotes(content: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert note-taking assistant. Generate clear, concise, well-structured notes from the provided content. Use markdown formatting with headers, bullet points, and highlights.',
      },
      {
        role: 'user',
        content: `Generate comprehensive notes from this content:\n\n${content}`,
      },
    ],
    max_tokens: 2048,
  });
  return completion.choices[0].message.content || '';
}

export async function generateSummary(content: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a summarization expert. Create brief, accurate summaries in 2-3 sentences.',
      },
      {
        role: 'user',
        content: `Summarize this content:\n\n${content}`,
      },
    ],
    max_tokens: 256,
  });
  return completion.choices[0].message.content || '';
}

export async function generateTags(content: string): Promise<string[]> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a tagging assistant. Return ONLY a JSON array of 3-5 relevant single-word or two-word tags. No explanation, just the JSON array.',
      },
      {
        role: 'user',
        content: `Generate tags for this content:\n\n${content}`,
      },
    ],
    max_tokens: 100,
  });

  try {
    const raw = completion.choices[0].message.content || '[]';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

export async function chatWithNotes(question: string, context: string, history: Array<{ role: string; content: string }>) {
  const messages: any[] = [
    {
      role: 'system',
      content: `You are a strict study assistant. You ONLY answer questions based on the notes provided below. 
If the question cannot be answered from the notes, respond with: "I can only answer questions based on your notes. This topic isn't covered in your current notes."
Never use outside knowledge. Never make up information.

NOTES:
${context || 'No notes available yet.'}`,
    },
    ...history.slice(-10),
    { role: 'user', content: question },
  ]

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    max_tokens: 1024,
  })

  return response.choices[0]?.message?.content || 'No response generated'
}

export async function generateQuiz(context: string, notebookTitle: string) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a quiz generator. Generate exactly 10 quiz questions based ONLY on the provided notes. 
Return ONLY valid JSON with no explanation, no markdown, no code fences.
Mix these types: 3 yes_no questions, 4 single_select questions, 2 multi_select questions, 1 text_input question.
Format:
{
  "questions": [
    {"id": 1, "type": "yes_no", "question": "...", "correct": true},
    {"id": 2, "type": "single_select", "question": "...", "options": ["A","B","C","D"], "correct": "A"},
    {"id": 3, "type": "multi_select", "question": "...", "options": ["A","B","C","D"], "correct": ["A","C"]},
    {"id": 4, "type": "text_input", "question": "...", "correct": "expected answer keywords"}
  ]
}`,
      },
      {
        role: 'user',
        content: `Generate 10 quiz questions from these notes about "${notebookTitle}":\n\n${context.slice(0, 6000)}`,
      },
    ],
    max_tokens: 2000,
  })

  const raw = response.choices[0]?.message?.content || ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}