import { useEffect, useState } from 'react'
import { Plus, BookOpen, Trash2, Search, NotebookPen, ChevronRight, LogOut, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Notebook, notebooksApi } from '@/lib/api'

import { User } from '@/lib/api'

interface SidebarProps {
  selectedNotebook: Notebook | null
  onNotebookSelect: (notebook: Notebook) => void
  refreshTrigger: number
  user: User | null
  onLogout: () => void
}

export default function Sidebar({ selectedNotebook, onNotebookSelect, refreshTrigger, user, onLogout }: SidebarProps) {  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Notebook | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fetchNotebooks = async () => {
    try {
      const res = await notebooksApi.getAll()
      setNotebooks(res.data)
    } catch {
      toast.error('Failed to load notebooks')
    }
  }

  useEffect(() => {
    fetchNotebooks()
  }, [refreshTrigger])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setLoading(true)
    try {
      const res = await notebooksApi.create(newTitle, newDescription)
      setNotebooks(prev => [res.data, ...prev])
      onNotebookSelect(res.data)
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

  const handleDeleteClick = (e: React.MouseEvent, notebook: Notebook) => {
    e.stopPropagation()
    setDeleteTarget(notebook)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await notebooksApi.delete(deleteTarget.id)
      setNotebooks(prev => prev.filter(n => n.id !== deleteTarget.id))
      if (selectedNotebook?.id === deleteTarget.id) {
        onNotebookSelect(null as any)
      }
      toast.success('Notebook deleted')
    } catch {
      toast.error('Failed to delete notebook')
    } finally {
      setDeleteTarget(null)
      setConfirmOpen(false)
    }
  }

  const filtered = notebooks.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const notebookColors = [
    'bg-blue-100 text-blue-600',
    'bg-violet-100 text-violet-600',
    'bg-pink-100 text-pink-600',
    'bg-amber-100 text-amber-600',
    'bg-emerald-100 text-emerald-600',
    'bg-cyan-100 text-cyan-600',
  ]

  return (
    <>
      <div className="w-72 h-screen flex flex-col shadow-sm"
        style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 60%, #3730a3 100%)' }}>

        <div className="px-5 py-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <NotebookPen className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-base">AI Notes</span>
              <p className="text-xs text-indigo-300 leading-none mt-0.5">Powered by Groq</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl h-9 font-semibold shadow-md border-0" size="sm">
                <Plus className="w-4 h-4" />
                New Notebook
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

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-indigo-300" />
            <Input
              placeholder="Search notebooks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-indigo-300 rounded-lg focus:bg-white/20"
            />
          </div>
        </div>

        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">My Notebooks</p>
        </div>

        <ScrollArea className="flex-1 px-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-indigo-300">No notebooks yet</p>
            </div>
          ) : (
            <div className="space-y-0.5 pb-4">
              {filtered.map((notebook, idx) => (
                <div
                  key={notebook.id}
                  onClick={() => onNotebookSelect(notebook)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    selectedNotebook?.id === notebook.id
                      ? 'bg-white/20 text-white'
                      : 'hover:bg-white/10 text-indigo-200'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${notebookColors[idx % notebookColors.length]}`}>
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notebook.title}</p>
                    {notebook.description && (
                      <p className="text-xs text-indigo-300 truncate">{notebook.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => handleDeleteClick(e, notebook)}
                      className="opacity-0 group-hover:opacity-100 text-indigo-300 hover:text-red-400 p-1 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {selectedNotebook?.id === notebook.id && (
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

<div className="px-4 py-3 border-t border-white/10 space-y-2">
  <p className="text-xs text-indigo-400 text-center">
    {notebooks.length} notebook{notebooks.length !== 1 ? 's' : ''}
  </p>

  <button
    onClick={() => window.location.href = '/dashboard'}
    className="w-full group relative overflow-hidden rounded-xl px-3 py-2.5 transition-all duration-300"
    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)', border: '1px solid rgba(255,255,255,0.15)' }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.5) 100%)' }} />
    <div className="relative flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <BarChart2 className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-xs font-semibold text-white">Quiz Dashboard</p>
        <p className="text-xs text-indigo-300">View scores & stats</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-indigo-300 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
    </div>
  </button>

  {user && (
    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{user.name}</p>
        <p className="text-xs text-indigo-300 truncate">{user.email}</p>
      </div>
      <button onClick={onLogout} className="text-indigo-300 hover:text-red-400 transition-colors p-1" title="Sign out">
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  )}
</div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notebook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteTarget?.title}"</span>? All notes inside will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}