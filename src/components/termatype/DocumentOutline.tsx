import { useState, useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'

export function DocumentOutline({ editor, menuLang = 'en' }: { editor: Editor | null; menuLang?: 'en' | 'bo' }) {
  const [headings, setHeadings] = useState<{ level: number; text: string; pos: number }[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!editor) return
    const extract = () => {
      const items: { level: number; text: string; pos: number }[] = []
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          items.push({ level: node.attrs.level, text: node.textContent, pos })
        }
      })
      setHeadings(items)
    }
    const debouncedExtract = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(extract, 300)
    }
    extract()
    editor.on('update', debouncedExtract)
    return () => { editor.off('update', debouncedExtract); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [editor])

  if (headings.length === 0) {
    return <div className="outline-empty">{menuLang === 'bo' ? 'མགོ་བྱང་མ་རྙེད། མགོ་བྱང་བསྒར་ན་ས་བཅད་མཐོང་ཐུབ།' : 'No headings found. Add headings to see a document outline.'}</div>
  }

  return (
    <div className="document-outline">
      {headings.map((h, i) => (
        <button
          key={i}
          className={`outline-item outline-h${h.level}`}
          onClick={() => {
            editor?.chain().focus().setTextSelection(h.pos + 1).run()
            const el = editor?.view.domAtPos(h.pos + 1)?.node as HTMLElement | undefined
            el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
          }}
        >
          {h.text || `Heading ${h.level}`}
        </button>
      ))}
    </div>
  )
}
