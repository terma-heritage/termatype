import { useState, useEffect, useCallback, useRef } from 'react'
import { invoke } from '@/lib/safe-invoke'
import type { Editor } from '@tiptap/react'

interface DictResult {
  headword: string
  headword_wylie: string | null
  definition: string
  source: string
  source_name: string
}

const isTibetan = (text: string) => /[ༀ-࿿]/.test(text)

export function DictionarySidebar({
  editor,
  onClose,
}: {
  editor: Editor | null
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DictResult[]>([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const entries = await invoke<DictResult[]>('lookup_dictionary', { query: term.trim() })
      setResults(entries)
    } catch {
      setResults([])
    }
    setSearching(false)
  }, [])

  useEffect(() => {
    if (!editor) return

    let debounceTimer: ReturnType<typeof setTimeout>
    const handleSelectionUpdate = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const { from, to } = editor.state.selection
        if (from === to) return
        const text = editor.state.doc.textBetween(from, to, ' ')
        if (text.trim()) {
          setQuery(text.trim())
          search(text.trim())
        }
      }, 300)
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => {
      clearTimeout(debounceTimer)
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, search])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  return (
    <div className="dictionary-sidebar">
      <div className="dictionary-header">
        <h3>Tibetan-English Dictionary</h3>
        <button className="dictionary-close" onClick={onClose} aria-label="Close dictionary">✕</button>
      </div>

      <form className="dictionary-search" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Tibetan or English..."
          className="dictionary-input"
        />
        <button type="submit" className="dictionary-search-btn">
          Search
        </button>
      </form>

      <div className="dictionary-results">
        {searching && <div className="dictionary-loading">Searching...</div>}
        {!searching && results.length === 0 && query && (
          <div className="dictionary-empty">No results found.</div>
        )}
        {results.map((entry, i) => (
          <div key={i} className="dictionary-entry">
            <div className="dictionary-entry-header">
              <span className={`dictionary-term${isTibetan(entry.headword) ? ' dictionary-term-tibetan' : ''}`}>{entry.headword}</span>
            </div>
            {entry.headword_wylie && (
              <div className="dictionary-wylie">{entry.headword_wylie}</div>
            )}
            <div className="dictionary-definition">{entry.definition}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
