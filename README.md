# 🧠 AI Notes — Intelligent Learning Assistant

An AI-powered full-stack learning platform that transforms raw content into structured notes, enables contextual chat, and evaluates understanding through automated quizzes.

Built using a **Retrieval-Augmented Generation (RAG)** architecture with real-time interaction and analytics.

---

## 🚀 Features

### 📝 Smart Notes Generation

* Generate structured notes from raw text input
* Automatic:

  * Summaries
  * Tags
  * Clean formatting (Markdown rendering)

### 📄 PDF to Knowledge

* Upload PDFs (≤ 10MB)
* Extract text automatically
* Convert into structured AI-generated notes

### 💬 Chat with Your Notes

* Context-aware AI chat based only on your notebook
* Maintains conversation history
* Markdown-rendered responses (lists, code, formatting)

### 🔎 Semantic Search

* Search notes using meaning (not just keywords)
* Powered by vector embeddings

### 🧠 Quiz Generation

* One-click **“Quiz Me”** feature
* Auto-generated MCQs from your notes
* Instant navigation to quiz interface

### 📊 Performance Analytics

* Track:

  * Average score
  * Best & lowest scores
  * Quiz trends
* Per-notebook performance breakdown

### 🗂 Notebook System

* Organize notes into notebooks
* Multi-notebook support
* Notebook-based context isolation

### 🔐 Authentication

* Secure login/signup using JWT
* User-specific data isolation

---

## 🧠 Core Architecture

This app uses a **RAG (Retrieval-Augmented Generation)** pipeline:

1. User uploads content (text or PDF)
2. Content is processed & structured
3. Text is converted into embeddings
4. Stored in vector database (Pinecone)
5. On query:

   * Relevant chunks are retrieved
   * Passed to LLM for grounded response

---

## ⚙️ Environment Variables

Create a `.env` file in your backend:

```env
OPENAI_API_KEY=

PINECONE_API_KEY=
PINECONE_INDEX=

HUGGINGFACE_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=

DATABASE_URL=
JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=
```

---

## 🔑 API Key Setup Guide

### ⚡ Groq (Primary LLM - Recommended)

* https://console.groq.com/
* Create API key
* Used for:

  * Chat
  * Notes generation
  * Quiz generation

---

### 🌲 Pinecone (Vector Database)

* https://www.pinecone.io/
* Create an index:

  * Dimension: **1024**
* Copy:

  * API Key
  * Index Name

---

### 🤖 OpenAI (Optional)

* https://platform.openai.com/
* Used as fallback LLM or embeddings

---

### 🤗 HuggingFace (Optional)

* https://huggingface.co/settings/tokens
* Used for embeddings (optional)

---

### 🔮 Google Gemini (Optional)

* https://aistudio.google.com/
* Alternative LLM provider

---

### 🧠 Cohere (If used for embeddings)

* https://dashboard.cohere.com/
* Model: `embed-english-v3.0`

---

### 🗄 Database (PostgreSQL)

#### Local

```
postgres://user:password@localhost:5432/db
```

#### Cloud (Recommended)

* https://neon.tech/
* https://supabase.com/

---

### 🔐 JWT Secret

```
JWT_SECRET=your_super_secure_secret
```

---

### 📧 Email (Optional)

Used for notifications / auth flows:

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_password
```

---

## 🛠 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ai-notes.git
cd ai-notes
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:3001
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔌 API Overview

### Auth

* `POST /auth/signup`
* `POST /auth/login`

### Notes

* `POST /notes` → Generate AI note
* `GET /notes/:notebookId`
* `DELETE /notes/:id`

### PDF

* `POST /upload/pdf`

### Chat

* `POST /chat`
* Context-aware responses

### Quiz

* `POST /quiz/generate`
* `GET /quiz/:id`
* `POST /quiz/submit`

### Analytics

* `GET /quiz/stats`

---

## 🧩 Key Frontend Components

* **NotesPanel** → Create, view, delete notes
* **ChatPanel** → AI conversation + quiz trigger 
* **SearchPanel** → Semantic search
* **NotebookView** → Tab-based UI (Notes / Chat / Search)
* **Dashboard** → Quiz analytics

---

## ⚡ UX Highlights

* ⚡ Instant note generation
* 💬 ChatGPT-like interface
* 🎯 One-click quiz generation
* 📊 Visual analytics dashboard
* 📱 Clean, modern UI (Tailwind + shadcn)

---

## 🚀 Future Enhancements

* 🧾 Export notes (PDF / Markdown)
* 🔍 Hybrid search (BM25 + Vector)
* 📚 Cross-notebook querying
* 🤝 Collaboration (shared notebooks)
* 🧠 Adaptive quizzes (difficulty scaling)
* 🌐 Deployment (Docker + CI/CD)

---

## 🐛 Common Issues

### ❌ Chat not responding

✔ Check:

* GROQ_API_KEY
* Notebook has notes

---

### ❌ Quiz generation fails

✔ Ensure:

* Notes exist in notebook
* Backend is running

---

### ❌ PDF upload fails

✔ Check:

* File type = PDF
* Size < 10MB

---

### ❌ Empty search results

✔ Ensure:

* Embeddings are stored correctly
* Pinecone index is configured

