import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { NotebookPen, Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { authApi } from '@/lib/api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (!token) {
      toast.error('Invalid reset link')
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setSuccess(true)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 50%, #dbeafe 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #4f46e5, transparent)' }} />
      </div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <NotebookPen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Notes</h1>
          <p className="text-gray-500 mt-1 text-sm">Your intelligent notebook</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-gray-900">
              {success ? 'Password reset!' : 'Set new password'}
            </CardTitle>
            <CardDescription>
              {success ? 'Your password has been updated successfully' : 'Choose a strong new password'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {success ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-sm text-gray-600">You can now sign in with your new password.</p>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-10 text-white font-semibold border-0"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  Go to Sign In
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="h-10 border-gray-200 focus:border-indigo-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                    className="h-10 border-gray-200 focus:border-indigo-400"
                  />
                </div>
                <Button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full h-10 text-white font-semibold rounded-lg border-0 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting...
                    </div>
                  ) : 'Reset Password'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {!success && (
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Back to sign in
            </Link>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Powered by Groq · Pinecone · OpenAI
        </div>
      </div>
    </div>
  )
}