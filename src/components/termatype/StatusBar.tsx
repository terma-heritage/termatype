import { useState, useEffect, useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { countWords } from '@/lib/word-count'
import { TIBETAN_LABELS } from './tibetan-labels'

export function StatusBar({
  editor,
  fileName,
  isDirty,
  lastSaved,
  autoSaveError,
  zoom,
  menuLang = 'en',
}: {
  editor: Editor | null
  fileName: string
  isDirty: boolean
  lastSaved: Date | null
  autoSaveError: string | null
  zoom: number
  menuLang?: 'en' | 'bo'
}) {
  const t = useCallback((label: string) => menuLang === 'bo' ? (TIBETAN_LABELS[label] || label) : label, [menuLang])

  // Current time as state (kept out of render to stay pure), refreshed on a slow
  // tick so "saved Ns ago" stays roughly current.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15000)
    return () => window.clearInterval(id)
  }, [])

  const getSaveStatus = () => {
    if (autoSaveError) return menuLang === 'bo' ? 'ཉར་ཚགས་མི་ཐུབ།' : 'Save failed'
    if (isDirty) return t('Modified')
    if (lastSaved) {
      const seconds = Math.floor((now - lastSaved.getTime()) / 1000)
      if (seconds < 5) return menuLang === 'bo' ? 'ད་ལྟ་ཉར་ཚགས།' : 'Saved just now'
      if (seconds < 60) return menuLang === 'bo' ? `${seconds} སྐར་ཆ་སྔོན་ཉར།` : `Saved ${seconds}s ago`
      return menuLang === 'bo' ? `${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ལ་ཉར།` : `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
    return menuLang === 'bo' ? 'ཡིག་ཆ་གསར་པ།' : 'New document'
  }

  const [showStats, setShowStats] = useState(false)
  const statsPopupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showStats) return
    const handleClick = (e: MouseEvent) => {
      if (statsPopupRef.current && !statsPopupRef.current.contains(e.target as Node)) {
        setShowStats(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStats(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showStats])
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
    // Recompute immediately (also triggers on tab switch since fileName changes)
    computeStats()
    editor.on('update', update)
    return () => { editor.off('update', update); if (timer) clearTimeout(timer) }
  }, [editor, fileName])

  const { words, chars, charsNoSpaces, sentences, paragraphs, tibetanSyllables } = docStats
  const readingTime = Math.max(1, Math.ceil(words / 200))
  const pageCount = Math.max(1, Math.ceil(words / 250))

  return (
    <div className={`termatype-status-bar${menuLang === 'bo' ? ' status-bar-tibetan' : ''}`}>
      <span className="status-filename">{fileName}</span>
      <span className="status-separator">|</span>
      <span className={`status-save${autoSaveError ? ' status-error' : ''}`} title={autoSaveError || undefined}>{getSaveStatus()}</span>
      <span className="status-spacer" />
      <button className="status-count status-clickable" onClick={() => setShowStats(!showStats)} title="Click for detailed statistics">
        {words.toLocaleString()} {t('words')} | {chars.toLocaleString()} {t('chars')} | ~{readingTime} {t('min')} | {pageCount} {t('pg')}
      </button>
      {showStats && (
        <div ref={statsPopupRef} className={`status-stats-popup${menuLang === 'bo' ? ' status-stats-tibetan' : ''}`} role="dialog" aria-label="Document statistics">
          <div className="status-stats-row"><span>{menuLang === 'bo' ? 'ཚིག' : 'Words'}</span><span>{words.toLocaleString()}</span></div>
          <div className="status-stats-row"><span>{menuLang === 'bo' ? 'ཡིག་འབྲུ' : 'Characters'}</span><span>{chars.toLocaleString()}</span></div>
          <div className="status-stats-row"><span>{menuLang === 'bo' ? 'ཡིག་འབྲུ (བར་སྟོང་མེད)' : 'Characters (no spaces)'}</span><span>{charsNoSpaces.toLocaleString()}</span></div>
          <div className="status-stats-row"><span>{menuLang === 'bo' ? 'ཚིག་གྲུབ' : 'Sentences'}</span><span>{sentences.toLocaleString()}</span></div>
          <div className="status-stats-row"><span>{menuLang === 'bo' ? 'ཡིག་དོན' : 'Paragraphs'}</span><span>{paragraphs.toLocaleString()}</span></div>
          {tibetanSyllables > 0 && (
            <div className="status-stats-row"><span>{menuLang === 'bo' ? 'བོད་ཡིག་ཚེག་བར' : 'Tibetan syllables'}</span><span>{tibetanSyllables.toLocaleString()}</span></div>
          )}
          <div className="status-stats-row"><span>{menuLang === 'bo' ? 'ཀློག་དུས' : 'Reading time'}</span><span>~{readingTime} {menuLang === 'bo' ? 'སྐར་མ' : 'min'}</span></div>
          <div className="status-stats-row"><span>{menuLang === 'bo' ? 'ཤོག་ངོས (ཚོད་དཔག)' : 'Pages (est.)'}</span><span>{pageCount}</span></div>
        </div>
      )}
      <span className="status-separator">|</span>
      <span className="status-count">{zoom}%</span>
      <span className="status-separator">|</span>
      <span className="status-privacy" title="100% private — all processing happens on your device">🔒 {t('Local')}</span>
    </div>
  )
}
