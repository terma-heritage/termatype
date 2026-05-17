import { useState, useEffect } from 'react'
import type { Editor } from '@tiptap/react'

export function DocumentOutline({ editor }: { editor: Editor | null }) {
  const [headings, setHeadings] = useState<{ level: number; text: string; pos: number }[]>([])

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
    extract()
    editor.on('update', extract)
    return () => { editor.off('update', extract) }
  }, [editor])

  if (headings.length === 0) {
    return <div className="outline-empty">No headings found. Add headings to see a document outline.</div>
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
