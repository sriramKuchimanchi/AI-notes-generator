import { useState } from 'react'
import { FileText, MessageSquare, Search } from 'lucide-react'
import NotesPanel from '@/components/NotesPanel'
import ChatPanel from '@/components/ChatPanel'
import SearchPanel from '@/components/SearchPanel'
import { Notebook } from '@/lib/api'

interface NotebookViewProps {
  notebook: Notebook
  onRefresh: () => void
}

type Tab = 'notes' | 'chat' | 'search'

export default function NotebookView({ notebook, onRefresh }: NotebookViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('notes')

  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
    { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" />, color: 'text-gray-500 hover:text-blue-600 hover:bg-blue-50', activeColor: 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" />, color: 'text-gray-500 hover:text-violet-600 hover:bg-violet-50', activeColor: 'bg-violet-50 text-violet-600 border-b-2 border-violet-500' },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" />, color: 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50', activeColor: 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500' },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="py-4">
            <h1 className="text-lg font-bold text-gray-900">{notebook.title}</h1>
            {notebook.description && (
              <p className="text-xs text-gray-400 mt-0.5">{notebook.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab.id ? tab.activeColor : tab.color
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'notes' && <NotesPanel notebook={notebook} onRefresh={onRefresh} />}
        {activeTab === 'chat' && <ChatPanel notebook={notebook} />}
        {activeTab === 'search' && <SearchPanel notebook={notebook} />}
      </div>
    </div>
  )
}