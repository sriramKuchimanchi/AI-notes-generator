import { useState } from 'react'
import { Search, Sparkles, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { Note, Notebook, searchApi } from '@/lib/api'

interface SearchPanelProps {
  notebook: Notebook
}

export default function SearchPanel({ notebook }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await searchApi.search(query, notebook.id)
      setResults(res.data)
    } catch {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search notes semantically..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading || !query.trim()} className="gap-2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Search
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Uses AI semantic search — finds notes by meaning, not just keywords
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {!searched ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm">Search your notes using natural language</p>
            <p className="text-xs mt-1">e.g. "machine learning concepts" or "important deadlines"</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No matching notes found</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            {results.map(note => (
              <Card key={note.id} className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm">{note.title}</h3>
                  </div>
                  {note.summary && (
                    <p className="text-xs text-gray-500 mt-1">{note.summary}</p>
                  )}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-2">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {note.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0 pb-4 px-4">
                  <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}