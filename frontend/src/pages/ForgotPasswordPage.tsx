import { useState } from 'react'
import { Link } from 'react-router-dom'
import { NotebookPen, ArrowLeft, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { authApi } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
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
              {sent ? 'Check your email' : 'Forgot password?'}
            </CardTitle>
            <CardDescription>
              {sent
                ? `We sent a reset link to ${email}`
                : 'Enter your email and we\'ll send you a reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-indigo-500" />
                </div>
                <p className="text-sm text-gray-600">
                  Check your inbox and click the link to reset your password. The link expires in 1 hour.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSent(false)}
                  className="w-full"
                >
                  Send again
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    className="h-10 border-gray-200 focus:border-indigo-400"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-10 text-white font-semibold rounded-lg border-0 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : 'Send Reset Link'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Powered by Groq · Pinecone · OpenAI
        </div>
      </div>
    </div>
  )
}