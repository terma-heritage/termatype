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

const SOURCE_LABELS: Record<string, string> = {
  'rangjung-yeshe': 'RY',
  'monlam-tib-eng': 'Monlam',
  'monlam-eng-tib': 'Monlam',
}

export function InlineDictionary({ editor }: { editor: Editor | null }) {
  const [popup, setPopup] = useState<{ x: number; y: number; word: string } | null>(null)
  const [results, setResults] = useState<DictResult[]>([])
  const [loading, setLoading] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const lookup = useCallback(async (word: string) => {
    setLoading(true)
    try {
      const entries = await invoke<DictResult[]>('lookup_dictionary', { query: word.trim() })
      setResults(entries)
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  // Listen for right-click on the editor
  useEffect(() => {
    if (!editor) return
    const editorDom = editor.view.dom

    const handleContextMenu = (e: MouseEvent) => {
      const { from, to } = editor.state.selection
      if (from === to) return // No selection, let default context menu work

      const text = editor.state.doc.textBetween(from, to, ' ').trim()
      if (!text || text.length > 100) return // Too long or empty

      e.preventDefault()
      setPopup({ x: e.clientX, y: e.clientY, word: text })
      lookup(text)
    }

    editorDom.addEventListener('contextmenu', handleContextMenu)
    return () => editorDom.removeEventListener('contextmenu', handleContextMenu)
  }, [editor, lookup])

  // Close on click outside
  useEffect(() => {
    if (!popup) return
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopup(null)
    }
    window.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [popup])

  if (!popup) return null

  // Clamp position to viewport
  const maxX = window.innerWidth - 320
  const maxY = window.innerHeight - 300
  const x = Math.min(popup.x, maxX)
  const y = Math.min(popup.y + 5, maxY)

  return (
    <div
      ref={popupRef}
      className="inline-dict-popup"
      style={{ left: x, top: y }}
    >
      <div className="inline-dict-header">
        <span className="inline-dict-word">{popup.word}</span>
        <button className="inline-dict-close" onClick={() => setPopup(null)}>×</button>
      </div>
      <div className="inline-dict-body">
        {loading && <div className="inline-dict-loading">Looking up…</div>}
        {!loading && results.length === 0 && (
          <div className="inline-dict-empty">No definitions found</div>
        )}
        {!loading && results.slice(0, 5).map((r, i) => (
          <div key={i} className="inline-dict-entry">
            <span className="inline-dict-source">{SOURCE_LABELS[r.source] || r.source}</span>
            <div className="inline-dict-def">{r.definition}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
