import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quizApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react'

export default function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    quizApi.getQuiz(id!).then(res => {
      setQuiz(res.data)
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load quiz')
      setLoading(false)
    })
  }, [id])

  const handleAnswer = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleMultiSelect = (questionId: number, option: string) => {
    setAnswers(prev => {
      const current: string[] = prev[questionId] || []
      return {
        ...prev,
        [questionId]: current.includes(option)
          ? current.filter(o => o !== option)
          : [...current, option],
      }
    })
  }

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((q: any) => answers[q.id] === undefined)
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`)
      return
    }
    setSubmitting(true)
    try {
      const res = await quizApi.submit(quiz.id, answers)
      setResult(res.data)
      setSubmitted(true)
      window.scrollTo(0, 0)
    } catch {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quiz) return null

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: result.percentage >= 70 ? 'linear-gradient(135deg, #10b981, #059669)' : result.percentage >= 40 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{quiz.title}</h1>
            <p className="text-5xl font-black mt-4 mb-1" style={{ color: result.percentage >= 70 ? '#10b981' : result.percentage >= 40 ? '#f59e0b' : '#ef4444' }}>
              {result.percentage}%
            </p>
            <p className="text-gray-500 text-lg">{result.score} / {result.total} correct</p>
            <p className="text-gray-400 mt-2 text-sm">
              {result.percentage >= 70 ? 'Great job!' : result.percentage >= 40 ? 'Keep studying!' : 'Review your notes and try again!'}
            </p>
            <div className="flex gap-3 mt-6 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Notes
              </Button>
              <Button onClick={() => navigate('/dashboard')}
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                className="text-white border-0">
                View Dashboard
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q: any, i: number) => {
              const userAns = answers[q.id]
              let isCorrect = false
              if (q.type === 'yes_no') isCorrect = userAns === q.correct
              else if (q.type === 'single_select') isCorrect = userAns === q.correct
              else if (q.type === 'multi_select') {
                const ua = Array.isArray(userAns) ? [...userAns].sort() : []
                const ca = Array.isArray(q.correct) ? [...q.correct].sort() : []
                isCorrect = JSON.stringify(ua) === JSON.stringify(ca)
              } else if (q.type === 'text_input') {
                const keywords = q.correct.toLowerCase().split(' ')
                const ans = String(userAns || '').toLowerCase()
                isCorrect = keywords.filter((k: string) => ans.includes(k)).length >= Math.ceil(keywords.length * 0.5)
              }

              return (
                <div key={q.id} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${isCorrect ? 'border-emerald-400' : 'border-red-400'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Q{i + 1}. {q.question}</p>
                      <p className="text-xs text-gray-500">Your answer: <span className="font-medium text-gray-700">{Array.isArray(userAns) ? userAns.join(', ') : String(userAns)}</span></p>
                      {!isCorrect && <p className="text-xs text-emerald-600 mt-0.5">Correct: <span className="font-medium">{Array.isArray(q.correct) ? q.correct.join(', ') : String(q.correct)}</span></p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{quiz.questions.length} questions · Answer all to submit</p>
        </div>

        <div className="space-y-5">
          {quiz.questions.map((q: any, i: number) => (
            <div key={q.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="font-semibold text-gray-800 mb-4 text-sm">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs mr-2 font-bold"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>{i + 1}</span>
                {q.question}
              </p>

              {q.type === 'yes_no' && (
                <div className="flex gap-3">
                  {[true, false].map(val => (
                    <button key={String(val)}
                      onClick={() => handleAnswer(q.id, val)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${answers[q.id] === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                      {val ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'single_select' && (
                <div className="space-y-2">
                  {q.options.map((opt: string) => (
                    <button key={opt}
                      onClick={() => handleAnswer(q.id, opt)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border-2 transition-all ${answers[q.id] === opt ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'multi_select' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
                  {q.options.map((opt: string) => {
                    const selected = (answers[q.id] || []).includes(opt)
                    return (
                      <button key={opt}
                        onClick={() => handleMultiSelect(q.id, opt)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border-2 transition-all flex items-center gap-2 ${selected ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                          {selected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              )}

              {q.type === 'text_input' && (
                <Input
                  placeholder="Type your answer..."
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswer(q.id, e.target.value)}
                  className="border-gray-200 focus:border-indigo-400"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 mb-10">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 text-white font-semibold text-base border-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : 'Submit Quiz'}
          </Button>
        </div>
      </div>
    </div>
  )
}