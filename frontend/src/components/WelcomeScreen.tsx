import { useState } from 'react'
import { Plus, NotebookPen, Sparkles, MessageSquare, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Notebook, notebooksApi } from '@/lib/api'

interface WelcomeScreenProps {
  onNotebookSelect: (notebook: Notebook) => void
  onRefresh: () => void
}

export default function WelcomeScreen({ onNotebookSelect, onRefresh }: WelcomeScreenProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setLoading(true)
    try {
      const res = await notebooksApi.create(newTitle, newDescription)
      onNotebookSelect(res.data)
      onRefresh()
      setNewTitle('')
      setNewDescription('')
      setDialogOpen(false)
      toast.success('Notebook created!')
    } catch {
      toast.error('Failed to create notebook')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center bg-gray-50 px-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
            <NotebookPen className="w-10 h-10 text-white" />
          </div>
        </div>

       <div className="grid grid-cols-3 gap-4 text-left">
          <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <Sparkles className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">AI Note Generation</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Paste content or upload a PDF and get structured notes with summaries and tags automatically.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center mb-3">
              <MessageSquare className="w-4.5 h-4.5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Chat with Notes</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Ask questions and get AI-powered answers strictly based on your notebook content.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <Brain className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Quiz Yourself</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">Auto-generate 10 questions from your notes and track your scores on the dashboard.</p>
          </div>
        </div>

       <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 text-white rounded-xl px-8 h-12 text-base shadow-lg border-0 font-semibold"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
                <Plus className="w-5 h-5" />
                Create your notebook
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notebook</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Notebook title" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} />
              <Input placeholder="Description (optional)" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
              <Button onClick={handleCreate} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Notebook'}
              </Button>
            </div>
          </DialogContent>
     </Dialog>
        </div>
      </div>
    </div>
  )
}