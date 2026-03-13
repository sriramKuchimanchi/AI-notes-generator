import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { ChatMessage, Notebook, chatApi } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import { quizApi } from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'

interface ChatPanelProps {
  notebook: Notebook
}

export default function ChatPanel({ notebook }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([])
  }, [notebook.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

const navigate = useNavigate()
const [generatingQuiz, setGeneratingQuiz] = useState(false)

const handleQuizMe = async () => {
  setGeneratingQuiz(true)
  try {
    const res = await quizApi.generate(notebook.id)
    navigate(`/quiz/${res.data.id}`)
  } catch {
    toast.error('Failed to generate quiz. Make sure you have notes in this notebook.')
  } finally {
    setGeneratingQuiz(false)
  }
}

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMessage: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const res = await chatApi.chat(input, notebook.id, messages)
      const assistantMessage: ChatMessage = { role: 'assistant', content: res.data.answer }
      setMessages(prev => [...prev, assistantMessage])
    } catch {
      toast.error('Chat failed. Please try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <p className="text-sm font-medium text-gray-700">Chat with Notes</p>
          <p className="text-xs text-gray-400">Answers strictly based on your notes</p>
        </div>
        <Button
          onClick={handleQuizMe}
          disabled={generatingQuiz}
          size="sm"
          className="gap-2 text-white border-0"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          {generatingQuiz ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          Quiz Me!
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Chat with your notes</p>
            <p className="text-xs mt-1">Ask anything about the content in this notebook</p>
            <div className="mt-6 space-y-2 w-full max-w-sm">
              {['Summarize my notes', 'What are the key concepts?', 'Explain the main ideas'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="text-sm leading-relaxed mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside mt-1 space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mt-1 space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        code: ({ children }) => <code className="bg-gray-200 px-1 rounded text-xs font-mono">{children}</code>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="shrink-0 p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your notes..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">AI answers based on your notebook notes</p>
      </div>
    </div>
  )
}