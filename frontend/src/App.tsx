import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Sidebar from '@/components/Sidebar'
import NotebookView from '@/components/NotebookView'
import WelcomeScreen from '@/components/WelcomeScreen'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import QuizPage from '@/pages/QuizPage'
import DashboardPage from '@/pages/DashboardPage'
import { Notebook, User } from '@/lib/api'

function ProtectedApp() {
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        selectedNotebook={selectedNotebook}
        onNotebookSelect={setSelectedNotebook}
        refreshTrigger={refreshTrigger}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-hidden">
        {selectedNotebook ? (
          <NotebookView notebook={selectedNotebook} onRefresh={() => setRefreshTrigger(p => p + 1)} />
        ) : (
          <WelcomeScreen onNotebookSelect={setSelectedNotebook} onRefresh={() => setRefreshTrigger(p => p + 1)} />
        )}
      </div>
      <Toaster />
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
   <Route path="/" element={<RequireAuth><ProtectedApp /></RequireAuth>} />
<Route path="/quiz/:id" element={<RequireAuth><QuizPage /></RequireAuth>} />
<Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}