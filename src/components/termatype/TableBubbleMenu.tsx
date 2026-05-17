import { useCallback, useEffect, useState } from 'react'
import { type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'

function IconBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      className="table-bubble-btn"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

export function TableBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top', offset: 8 }}
      shouldShow={() => editor.isActive('table')}
    >
      <div className="bubble-menu table-bubble-menu">
        <IconBtn
          onClick={() => editor.chain().focus().addRowBefore().run()}
          title="Insert row above"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="13" width="18" height="8" rx="1" />
            <path d="M12 3v6M9 6h6" />
          </svg>
        </IconBtn>
        <IconBtn
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="Insert row below"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="8" rx="1" />
            <path d="M12 15v6M9 18h6" />
          </svg>
        </IconBtn>
        <IconBtn
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          title="Insert column left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="13" y="3" width="8" height="18" rx="1" />
            <path d="M3 12h6M6 9v6" />
          </svg>
        </IconBtn>
        <IconBtn
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="Insert column right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="8" height="18" rx="1" />
            <path d="M15 12h6M18 9v6" />
          </svg>
        </IconBtn>

        <span className="bubble-sep" />

        <IconBtn
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          title="Delete row"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="8" width="18" height="8" rx="1" />
            <path d="M9 12h6" strokeWidth="2.5" />
          </svg>
        </IconBtn>
        <IconBtn
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
          title="Delete column"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="8" y="3" width="8" height="18" rx="1" />
            <path d="M12 9v6" strokeWidth="2.5" transform="rotate(90 12 12)" />
          </svg>
        </IconBtn>

        <span className="bubble-sep" />

        <IconBtn
          onClick={() => editor.chain().focus().mergeCells().run()}
          disabled={!editor.can().mergeCells()}
          title="Merge cells"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 12h8M11 9l-3 3 3 3M13 9l3 3-3 3" />
          </svg>
        </IconBtn>
        <IconBtn
          onClick={() => editor.chain().focus().splitCell().run()}
          disabled={!editor.can().splitCell()}
          title="Split cell"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 3v18" strokeDasharray="2 2" />
          </svg>
        </IconBtn>

        <span className="bubble-sep" />

        <IconBtn
          onClick={() => editor.chain().focus().deleteTable().run()}
          title="Delete table"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </IconBtn>
      </div>
    </BubbleMenu>
  )
}

export function TableContextMenu({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const close = useCallback(() => setPos(null), [])

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (!editor.isActive('table')) return

      const target = e.target as HTMLElement
      const cell = target.closest('td, th')
      if (!cell) return

      e.preventDefault()
      setPos({ x: e.clientX, y: e.clientY })
    }

    const editorEl = editor.view.dom
    editorEl.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      editorEl.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [editor, close])

  if (!pos) return null

  const run = (cmd: () => void) => {
    cmd()
    close()
  }

  const items = [
    { label: 'Insert row above', action: () => run(() => editor.chain().focus().addRowBefore().run()) },
    { label: 'Insert row below', action: () => run(() => editor.chain().focus().addRowAfter().run()) },
    { sep: true },
    { label: 'Insert column left', action: () => run(() => editor.chain().focus().addColumnBefore().run()) },
    { label: 'Insert column right', action: () => run(() => editor.chain().focus().addColumnAfter().run()) },
    { sep: true },
    { label: 'Delete row', action: () => run(() => editor.chain().focus().deleteRow().run()), disabled: !editor.can().deleteRow() },
    { label: 'Delete column', action: () => run(() => editor.chain().focus().deleteColumn().run()), disabled: !editor.can().deleteColumn() },
    { label: 'Delete table', action: () => run(() => editor.chain().focus().deleteTable().run()) },
    { sep: true },
    { label: 'Merge cells', action: () => run(() => editor.chain().focus().mergeCells().run()), disabled: !editor.can().mergeCells() },
    { label: 'Split cell', action: () => run(() => editor.chain().focus().splitCell().run()), disabled: !editor.can().splitCell() },
  ]

  return (
    <div
      className="table-context-menu"
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.map((item, i) =>
        'sep' in item ? (
          <div key={i} className="table-context-sep" />
        ) : (
          <button
            key={i}
            className="table-context-item"
            onClick={item.action}
            disabled={item.disabled}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  )
}
