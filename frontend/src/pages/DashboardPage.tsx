import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { quizApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, Target, TrendingUp, BookOpen, RotateCcw, Brain } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    quizApi.getDashboard().then(res => {
      setData(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'A+', color: '#10b981', bg: '#ecfdf5' }
    if (pct >= 80) return { label: 'A', color: '#10b981', bg: '#ecfdf5' }
    if (pct >= 70) return { label: 'B', color: '#3b82f6', bg: '#eff6ff' }
    if (pct >= 60) return { label: 'C', color: '#f59e0b', bg: '#fffbeb' }
    if (pct >= 40) return { label: 'D', color: '#f97316', bg: '#fff7ed' }
    return { label: 'F', color: '#ef4444', bg: '#fef2f2' }
  }

  const getOverallGrade = () => {
    const avg = Number(data?.stats?.avg_score || 0)
    return getGrade(avg)
  }

  const getChartData = () => {
    if (!data?.attempts) return []
    return [...data.attempts].reverse().slice(-10).map((a: any, i: number) => ({
      attempt: `#${i + 1}`,
      score: Number(a.percentage),
      quiz: a.quiz_title,
    }))
  }

  const getNotebookBreakdown = () => {
    if (!data?.attempts) return []
    const map: Record<string, { total: number; count: number; title: string }> = {}
    data.attempts.forEach((a: any) => {
      if (!map[a.notebook_title]) map[a.notebook_title] = { total: 0, count: 0, title: a.notebook_title }
      map[a.notebook_title].total += Number(a.percentage)
      map[a.notebook_title].count++
    })
    return Object.values(map).map(v => ({
      title: v.title,
      avg: Math.round((v.total / v.count) * 100) / 100,
      count: v.count,
    })).sort((a, b) => b.avg - a.avg)
  }

  const circumference = 2 * Math.PI * 40
  const avg = Number(data?.stats?.avg_score || 0)
  const strokeDashoffset = circumference - (avg / 100) * circumference
  const overallGrade = getOverallGrade()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stats = data?.stats
  const attempts = data?.attempts || []
  const chartData = getChartData()
  const notebookBreakdown = getNotebookBreakdown()

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(135deg, #f8f7ff 0%, #f0f4ff 100%)' }}>
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-2 text-gray-500 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notes
            </Button>
            <h1 className="text-3xl font-black text-gray-900">Quiz Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Track your learning progress</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
            <Brain className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-600">{stats?.total_attempts || 0} quizzes taken</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <p className="text-sm font-semibold text-gray-500 mb-4">Overall Performance</p>
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={overallGrade.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black" style={{ color: overallGrade.color }}>{overallGrade.label}</span>
                <span className="text-xs text-gray-400">{avg.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {avg >= 70 ? 'Excellent work!' : avg >= 40 ? 'Keep studying!' : 'More practice needed'}
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {[
              { icon: Target, label: 'Total Quizzes', value: stats?.total_attempts || 0, color: '#4f46e5', suffix: '' },
              { icon: TrendingUp, label: 'Avg Score', value: stats?.avg_score ? Number(stats.avg_score).toFixed(1) : 'N/A', color: '#7c3aed', suffix: stats?.avg_score ? '%' : '' },
              { icon: Trophy, label: 'Best Score', value: stats?.best_score ? Number(stats.best_score).toFixed(1) : 'N/A', color: '#10b981', suffix: stats?.best_score ? '%' : '' },
              { icon: BookOpen, label: 'Lowest Score', value: stats?.lowest_score ? Number(stats.lowest_score).toFixed(1) : 'N/A', color: '#f59e0b', suffix: stats?.lowest_score ? '%' : '' },
            ].map(({ icon: Icon, label, value, color, suffix }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color }} />
                  </div>
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                </div>
                <p className="text-2xl font-black text-gray-900">{value}{suffix}</p>
              </div>
            ))}
          </div>
        </div>

        {chartData.length > 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Score Trend (last {chartData.length} attempts)
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="attempt" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Line
                  type="monotone" dataKey="score" stroke="#6366f1"
                  strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }}
                  activeDot={{ r: 7, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {notebookBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Performance by Notebook
            </h2>
            <div className="space-y-3">
              {notebookBreakdown.map((nb: any) => {
                const g = getGrade(nb.avg)
                return (
                  <div key={nb.title} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black" style={{ backgroundColor: g.bg, color: g.color }}>
                      {g.label}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{nb.title}</p>
                        <span className="text-sm font-bold ml-2" style={{ color: g.color }}>{nb.avg}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${nb.avg}%`, background: `linear-gradient(90deg, ${g.color}88, ${g.color})` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{nb.count} attempt{nb.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-indigo-500" />
          Recent Attempts
        </h2>

        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No quiz attempts yet.</p>
            <Button onClick={() => navigate('/')} className="mt-4" variant="outline">Go to Notes</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt: any) => {
              const grade = getGrade(Number(attempt.percentage))
              return (
                <div key={attempt.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                    style={{ backgroundColor: grade.bg, color: grade.color }}>
                    {grade.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{attempt.quiz_title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{attempt.notebook_title} · {new Date(attempt.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2 w-32 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${attempt.percentage}%`, background: `linear-gradient(90deg, ${grade.color}88, ${grade.color})` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <p className="font-black text-xl" style={{ color: grade.color }}>{attempt.percentage}%</p>
                    <p className="text-xs text-gray-400">{attempt.score}/{attempt.total}</p>
                    <button
                      onClick={() => navigate(`/quiz/${attempt.quiz_id}`)}
                      className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retake
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  )
}