import { useState, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import { countWords } from '@/lib/word-count'
import type { Lang } from '@/components/termatype/LanguageToggle'

export function StatusBar({
  editor,
  fileName,
  isDirty,
  lastSaved,
  autoSaveError,
  zoom,
  lang,
  onToggleLang,
}: {
  editor: Editor | null
  fileName: string
  isDirty: boolean
  lastSaved: Date | null
  autoSaveError: string | null
  zoom: number
  lang: Lang
  onToggleLang: () => void
}) {
  const getSaveStatus = () => {
    if (autoSaveError) return 'Save failed'
    if (isDirty) return 'Modified'
    if (lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
      if (seconds < 5) return 'Saved just now'
      if (seconds < 60) return `Saved ${seconds}s ago`
      return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
    return 'New document'
  }

  const [showStats, setShowStats] = useState(false)
  const [docStats, setDocStats] = useState({ words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, tibetanSyllables: 0 })
  useEffect(() => {
    if (!editor) return
    let timer: ReturnType<typeof setTimeout> | null = null
    const computeStats = () => {
      const text = editor.state.doc.textContent
      const charsNoSpaces = text.replace(/\s/g, '').length
      const sentences = text.split(/[.!?།]+/).filter(s => s.trim()).length
      const paragraphs = editor.state.doc.content.childCount
      const tibetanSegments = text.match(/[ༀ-࿿]+/g)
      const tibetanSyllables = tibetanSegments
        ? tibetanSegments.reduce((c, seg) => c + seg.split('་').filter(Boolean).length, 0)
        : 0
      setDocStats({ words: countWords(text), chars: text.length, charsNoSpaces, sentences, paragraphs, tibetanSyllables })
    }
    const update = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(computeStats, 300)
    }
    computeStats()
    editor.on('update', update)
    return () => { editor.off('update', update); if (timer) clearTimeout(timer) }
  }, [editor])

  const { words, chars, charsNoSpaces, sentences, paragraphs, tibetanSyllables } = docStats
  const readingTime = Math.max(1, Math.ceil(words / 200))
  const pageCount = Math.max(1, Math.ceil(words / 250))

  return (
    <div className="termatype-status-bar">
      <span className="status-filename">{fileName}</span>
      <span className="status-separator">|</span>
      <span className={`status-save${autoSaveError ? ' status-error' : ''}`} title={autoSaveError || undefined}>{getSaveStatus()}</span>
      <span className="status-spacer" />
      <span className="status-count status-clickable" onClick={() => setShowStats(!showStats)} title="Click for detailed statistics">
        {words.toLocaleString()} words | {chars.toLocaleString()} chars | ~{readingTime} min | {pageCount} pg
      </span>
      {showStats && (
        <div className="status-stats-popup">
          <div className="status-stats-row"><span>Words</span><span>{words.toLocaleString()}</span></div>
          <div className="status-stats-row"><span>Characters</span><span>{chars.toLocaleString()}</span></div>
          <div className="status-stats-row"><span>Characters (no spaces)</span><span>{charsNoSpaces.toLocaleString()}</span></div>
          <div className="status-stats-row"><span>Sentences</span><span>{sentences.toLocaleString()}</span></div>
          <div className="status-stats-row"><span>Paragraphs</span><span>{paragraphs.toLocaleString()}</span></div>
          {tibetanSyllables > 0 && (
            <div className="status-stats-row"><span>Tibetan syllables</span><span>{tibetanSyllables.toLocaleString()}</span></div>
          )}
          <div className="status-stats-row"><span>Reading time</span><span>~{readingTime} min</span></div>
          <div className="status-stats-row"><span>Pages (est.)</span><span>{pageCount}</span></div>
        </div>
      )}
      <span className="status-separator">|</span>
      <span className="status-count">{zoom}%</span>
      <span className="status-separator">|</span>
      <span className="status-lang" onClick={onToggleLang} title="Click to switch language">{lang === 'bo' ? 'བོད' : 'EN'}</span>
    </div>
  )
}
