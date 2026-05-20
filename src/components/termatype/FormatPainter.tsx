import { useState, useCallback, useEffect } from 'react'

import { useTiptapEditor } from '@/hooks/use-tiptap-editor'
import { Button } from '@/components/tiptap-ui-primitive/button'

interface StoredMark {
  type: string
  attrs: Record<string, unknown> | null
}

function PaintbrushIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
      <path d="M14.5 17.5 4.5 15" />
    </svg>
  )
}

export function FormatPainterButton() {
  const { editor } = useTiptapEditor()
  const [storedMarks, setStoredMarks] = useState<StoredMark[] | null>(null)
  const active = storedMarks !== null

  const handleClick = useCallback(() => {
    if (!editor) return

    if (active) {
      // Cancel format painter
      setStoredMarks(null)
      return
    }

    // Capture marks from current selection or cursor position
    const { from, to } = editor.state.selection
    if (from === to) {
      // No selection: use stored marks at cursor or active marks
      const marks =
        editor.state.storedMarks ?? editor.state.selection.$from.marks()
      setStoredMarks(marks.map((m) => m.toJSON() as StoredMark))
    } else {
      // Use marks from the first character of the selection
      const nodeAfter = editor.state.doc.resolve(from).nodeAfter
      const marks = nodeAfter?.marks ?? []
      setStoredMarks(marks.map((m) => m.toJSON() as StoredMark))
    }
  }, [editor, active])

  // When format painter is active, apply marks on next selection change
  useEffect(() => {
    if (!editor || !storedMarks) return

    const handler = () => {
      const { from, to } = editor.state.selection
      if (from === to) return // Wait for an actual text selection

      // Build a chain: remove existing marks, then apply stored ones
      let chain = editor.chain().focus()

      // Unset all known formatting marks from the selection
      const markTypesToClear = [
        'bold',
        'italic',
        'underline',
        'strike',
        'code',
        'highlight',
        'textStyle',
        'superscript',
        'subscript',
      ]

      for (const typeName of markTypesToClear) {
        if (editor.schema.marks[typeName]) {
          chain = chain.unsetMark(typeName)
        }
      }

      // Apply stored marks
      for (const mark of storedMarks) {
        const markType = editor.schema.marks[mark.type]
        if (markType) {
          chain = chain.setMark(markType, mark.attrs ?? undefined)
        }
      }

      chain.run()
      setStoredMarks(null) // Single use
    }

    editor.on('selectionUpdate', handler)
    return () => {
      editor.off('selectionUpdate', handler)
    }
  }, [editor, storedMarks])

  if (!editor) return null

  return (
    <Button
      type="button"
      variant="ghost"
      data-active-state={active ? 'on' : 'off'}
      role="button"
      tabIndex={-1}
      aria-label="Format Painter"
      aria-pressed={active}
      tooltip={
        active
          ? 'Cancel format painter'
          : 'Format Painter — copy formatting from selection'
      }
      onClick={handleClick}
    >
      <PaintbrushIcon className="tiptap-button-icon" />
    </Button>
  )
}
