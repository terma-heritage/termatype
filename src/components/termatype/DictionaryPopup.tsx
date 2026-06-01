import { useState, useEffect, useCallback, useRef } from 'react'
import { type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { invoke } from '@/lib/safe-invoke'
import { TIBETAN_LABELS } from './MenuBar'

interface DictResult {
  headword: string
  headword_wylie: string | null
  definition: string
  source: string
  source_name: string
}

const isTibetan = (text: string) => /[ༀ-࿿]/.test(text)
const MAX_RESULTS = 3
const DEBOUNCE_MS = 150

export function DictionaryPopup({ editor, onOpenSidebar, menuLang = 'en' }: { editor: Editor; onOpenSidebar?: () => void; menuLang?: 'en' | 'bo' }) {
  const [results, setResults] = useState<DictResult[]>([])
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const lastQueryRef = useRef('')

  const search = useCallback(async (term: string) => {
    if (!term.trim() || term.length > 200) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    try {
      const entries = await invoke<DictResult[]>('lookup_dictionary', { query: term.trim() })
      setResults(entries.slice(0, MAX_RESULTS))
    } catch {
      setResults([])
    }
    setSearching(false)
  }, [])

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      clearTimeout(debounceRef.current)

      const { from, to } = editor.state.selection
      if (from === to) {
        setResults([])
        setQuery('')
        lastQueryRef.current = ''
        return
      }

      const text = editor.state.doc.textBetween(from, to, ' ').trim()
      if (!text || text.length > 200) {
        setResults([])
        setQuery('')
        lastQueryRef.current = ''
        return
      }

      // Skip if same query
      if (text === lastQueryRef.current) return
      lastQueryRef.current = text
      setQuery(text)

      debounceRef.current = setTimeout(() => {
        search(text)
      }, DEBOUNCE_MS)
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    return () => {
      clearTimeout(debounceRef.current)
      editor.off('selectionUpdate', handleSelectionUpdate)
    }
  }, [editor, search])

  const handleInsert = useCallback((tibetanWord: string) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    editor.chain().focus().insertContentAt({ from, to }, tibetanWord).run()
    setResults([])
    setQuery('')
    lastQueryRef.current = ''
  }, [editor])

  const hasResults = results.length > 0
  const tibetanQuery = isTibetan(query)

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: 'bottom-start',
        offset: 6,
      }}
      shouldShow={({ state, from, to }) => {
        const { doc, selection } = state
        const text = doc.textBetween(from, to).trim()
        if (!text || selection.empty) return false

        // Don't show for images, uploads, tables
        if (editor.isActive('image') || editor.isActive('imageUpload') || editor.isActive('table')) return false

        // Only show if we have results
        return hasResults
      }}
    >
      <div className="dictionary-popup">
        {results.map((entry, i) => (
          <div key={i} className="dictionary-popup-entry">
            <div className="dictionary-popup-header">
              <span className={`dictionary-popup-term${isTibetan(entry.headword) ? ' dictionary-popup-term-tibetan' : ''}`}>
                {entry.headword}
              </span>
              {!tibetanQuery && isTibetan(entry.headword) && (
                <button
                  type="button"
                  className="dictionary-popup-insert"
                  onClick={() => handleInsert(entry.headword)}
                  title="Insert this word"
                >
                  ↵
                </button>
              )}
            </div>
            {entry.headword_wylie && (
              <div className="dictionary-popup-wylie">{entry.headword_wylie}</div>
            )}
            <div className="dictionary-popup-definition">{entry.definition}</div>
          </div>
        ))}
        {onOpenSidebar && (
          <button
            type="button"
            className="dictionary-popup-more"
            onClick={() => { onOpenSidebar(); }}
          >
            {menuLang === 'bo' ? (TIBETAN_LABELS['Open Dictionary ›'] || 'Open Dictionary ›') : 'Open Dictionary ›'}
          </button>
        )}
      </div>
    </BubbleMenu>
  )
}
