import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password']
        .includes(window.location.pathname)
      if (!isAuthRoute) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)  
  }
)

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Notebook {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Note {
  id: string;
  notebook_id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get<User>('/auth/me'),
};

export const notebooksApi = {
  getAll: () => api.get<Notebook[]>('/notes/notebooks'),
  create: (title: string, description: string) =>
    api.post<Notebook>('/notes/notebooks', { title, description }),
  delete: (id: string) => api.delete(`/notes/notebooks/${id}`),
};

export const notesApi = {
  getByNotebook: (notebookId: string) => api.get<Note[]>(`/notes/${notebookId}`),
  create: (notebookId: string, title: string, content: string) =>
    api.post<Note>(`/notes/${notebookId}`, { title, content }),
  update: (id: string, title: string, content: string) =>
    api.put<Note>(`/notes/${id}`, { title, content }),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

export const searchApi = {
  search: (query: string, notebookId?: string) =>
    api.post<Note[]>('/search', { query, notebookId }),
};

export const chatApi = {
  chat: (question: string, notebookId: string, history: ChatMessage[]) =>
    api.post<{ answer: string }>('/chat', { question, notebookId, history }),
};

export const uploadApi = {
  uploadPDF: (file: File, notebookId: string, title?: string) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('notebookId', notebookId);
    if (title) formData.append('title', title);
    return api.post<Note>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const quizApi = {
  generate: (notebookId: string) =>
    api.post<{ id: string; title: string; questions: any[] }>('/quiz/generate', { notebookId }),
  getQuiz: (id: string) =>
    api.get<{ id: string; title: string; questions: any[] }>(`/quiz/${id}`),
  submit: (quizId: string, answers: Record<number, any>) =>
    api.post<{ score: number; total: number; percentage: number }>('/quiz/submit', { quizId, answers }),
  getDashboard: () =>
    api.get<{ attempts: any[]; stats: any }>('/quiz/dashboard'),
};