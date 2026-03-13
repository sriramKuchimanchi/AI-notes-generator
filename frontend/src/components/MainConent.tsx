import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, MessageSquare, Search } from 'lucide-react'
import NotesPanel from '@/components/NotesPanel'
import ChatPanel from '@/components/ChatPanel'
import SearchPanel from '@/components/SearchPanel'
import { Notebook } from '@/lib/api'

interface MainContentProps {
  selectedNotebook: Notebook | null
  onRefresh: () => void
}

export default function MainContent({ selectedNotebook, onRefresh }: MainContentProps) {
  const [activeTab, setActiveTab] = useState('notes')

  if (!selectedNotebook) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Select a Notebook</h2>
            <p className="text-gray-400 text-sm mt-1">Choose a notebook from the sidebar or create a new one</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">{selectedNotebook.title}</h1>
        {selectedNotebook.description && (
          <p className="text-sm text-gray-500 mt-0.5">{selectedNotebook.description}</p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-3 border-b border-gray-100">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="notes" className="gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2 text-sm">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2 text-sm">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
          </TabsList>
        </div>

       <TabsContent value="notes" className="flex-1 overflow-hidden m-0 h-0">
          <NotesPanel notebook={selectedNotebook} onRefresh={onRefresh} />
        </TabsContent>
      <TabsContent value="chat" className="flex-1 overflow-hidden m-0 h-0">
          <ChatPanel notebook={selectedNotebook} />
        </TabsContent>
        <TabsContent value="search" className="flex-1 overflow-hidden m-0 h-0">
          <SearchPanel notebook={selectedNotebook} />
        </TabsContent>
      </Tabs>
    </div>
  )
}