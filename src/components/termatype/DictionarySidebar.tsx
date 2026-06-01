import { useState, useEffect, useCallback, useRef } from 'react'
import { invoke } from '@/lib/safe-invoke'
import { TIBETAN_LABELS } from './MenuBar'
import type { Editor } from '@tiptap/react'
import { type DictResult, isTibetan } from '@/lib/dictionary-types'

export function DictionarySidebar({
  editor,
  onClose,
  menuLang = 'en',
}: {
  editor: Editor | null
  onClose: () => void
  menuLang?: 'en' | 'bo'
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DictResult[]>([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = useCallback((label: string) => menuLang === 'bo' ? (TIBETAN_LABELS[label] || label) : label, [menuLang])

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

  const bo = menuLang === 'bo'

  return (
    <div className={`dictionary-sidebar${bo ? ' dictionary-tibetan' : ''}`}>
      <div className="dictionary-header">
        <h3>{t('Tibetan-English Dictionary')}</h3>
        <button className="dictionary-close" onClick={onClose} aria-label="Close dictionary">✕</button>
      </div>

      <form className="dictionary-search" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Search Tibetan or English...')}
          className="dictionary-input"
        />
        <button type="submit" className="dictionary-search-btn">
          {t('Search')}
        </button>
      </form>

      <div className="dictionary-results">
        {searching && <div className="dictionary-loading">{t('Searching...')}</div>}
        {!searching && results.length === 0 && query && (
          <div className="dictionary-empty">{t('No results found.')}</div>
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
