import { useState, useEffect, useCallback, useRef } from 'react'
import { type Editor } from '@tiptap/react'
import { invoke } from '@/lib/safe-invoke'
import { type DictResult, isTibetan } from '@/lib/dictionary-types'
const TIBETAN_WORD_RE = /[ༀ-࿿]+/
const HOVER_DELAY = 300
const HIDE_DELAY = 200

/**
 * Extract the Tibetan word (tsheg-delimited syllable group) at a given
 * character offset within a text node.
 */
function getTibetanWordAt(textContent: string, offset: number): string | null {
  if (offset < 0 || offset >= textContent.length) return null
  const ch = textContent[offset] ?? ''
  if (!isTibetan(ch)) return null

  // Walk left to find start (stop at tsheg ་ or non-Tibetan)
  let start = offset
  while (start > 0) {
    const prev = textContent[start - 1] ?? ''
    if (prev === '་' || prev === ' ' || prev === '།' || !isTibetan(prev)) break
    start--
  }

  // Walk right to find end
  let end = offset
  while (end < textContent.length) {
    const next = textContent[end] ?? ''
    if (next === '་' || next === ' ' || next === '།' || !isTibetan(next)) break
    end++
  }

  const word = textContent.slice(start, end).trim()
  return word && TIBETAN_WORD_RE.test(word) ? word : null
}

export function DictionaryHover({ editor }: { editor: Editor }) {
  const [result, setResult] = useState<DictResult | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lastWordRef = useRef('')
  const tooltipRef = useRef<HTMLDivElement>(null)

  const lookup = useCallback(async (word: string) => {
    try {
      const entries = await invoke<DictResult[]>('lookup_dictionary', { query: word })
      if (entries.length > 0 && lastWordRef.current === word) {
        setResult(entries[0] ?? null)
        setVisible(true)
      }
    } catch {
      // ignore
    }
  }, [])

  const hide = useCallback(() => {
    setVisible(false)
    visibleRef.current = false
    setResult(null)
    lastWordRef.current = ''
  }, [])

  useEffect(() => { visibleRef.current = visible }, [visible])

  useEffect(() => {
    if (!editor) return
    const editorEl = editor.view.dom

    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(hoverTimerRef.current)
      clearTimeout(hideTimerRef.current)

      // Don't show hover tooltip if there's an active text selection
      const { from, to } = editor.state.selection
      if (from !== to) {
        hide()
        return
      }

      // Check if hovering over the tooltip itself
      if (tooltipRef.current?.contains(e.target as Node)) return

      // Get the DOM node under cursor
      const target = e.target as Node
      if (!target || target.nodeType !== Node.TEXT_NODE && !(target as Element).closest?.('.ProseMirror')) {
        hideTimerRef.current = setTimeout(hide, HIDE_DELAY)
        return
      }

      // Use caretPositionFromPoint or caretRangeFromPoint to find text under cursor
      let textNode: Text | null = null
      let offset = 0

      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(e.clientX, e.clientY)
        if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
          textNode = range.startContainer as Text
          offset = range.startOffset
        }
      }

      if (!textNode) {
        hideTimerRef.current = setTimeout(hide, HIDE_DELAY)
        return
      }

      // Make sure the text node is inside the editor
      if (!editorEl.contains(textNode)) {
        hideTimerRef.current = setTimeout(hide, HIDE_DELAY)
        return
      }

      const word = getTibetanWordAt(textNode.textContent || '', offset)
      if (!word) {
        hideTimerRef.current = setTimeout(hide, HIDE_DELAY)
        return
      }

      // Same word, keep showing
      if (word === lastWordRef.current && visibleRef.current) return

      lastWordRef.current = word
      setPosition({ x: e.clientX, y: e.clientY })

      hoverTimerRef.current = setTimeout(() => {
        lookup(word)
      }, HOVER_DELAY)
    }

    const handleMouseLeave = () => {
      clearTimeout(hoverTimerRef.current)
      hideTimerRef.current = setTimeout(hide, HIDE_DELAY)
    }

    editorEl.addEventListener('mousemove', handleMouseMove)
    editorEl.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearTimeout(hoverTimerRef.current)
      clearTimeout(hideTimerRef.current)
      editorEl.removeEventListener('mousemove', handleMouseMove)
      editorEl.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [editor, lookup, hide])

  // Hide when user starts selecting
  useEffect(() => {
    if (!editor) return
    const handleSelection = () => {
      const { from, to } = editor.state.selection
      if (from !== to) hide()
    }
    editor.on('selectionUpdate', handleSelection)
    return () => { editor.off('selectionUpdate', handleSelection) }
  }, [editor, hide])

  if (!visible || !result || !position) return null

  // Position the tooltip near cursor, clamped to viewport
  const tooltipWidth = 280 // max-width from CSS
  const tooltipHeight = 100 // approximate
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - tooltipWidth - 16),
    top: position.y + 20 + tooltipHeight > window.innerHeight
      ? position.y - tooltipHeight - 8  // show above cursor
      : position.y + 20,               // show below cursor
    zIndex: 9999,
  }

  return (
    <div
      ref={tooltipRef}
      className="dictionary-hover"
      style={style}
      onMouseEnter={() => clearTimeout(hideTimerRef.current)}
      onMouseLeave={() => { hideTimerRef.current = setTimeout(hide, HIDE_DELAY) }}
    >
      <div className="dictionary-hover-term">{result.headword}</div>
      {result.headword_wylie && (
        <div className="dictionary-hover-wylie">{result.headword_wylie}</div>
      )}
      <div className="dictionary-hover-definition">{result.definition}</div>
    </div>
  )
}
