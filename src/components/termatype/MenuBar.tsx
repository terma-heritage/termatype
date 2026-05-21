import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Editor } from '@tiptap/react'
import { TableGridPicker } from './TableGridPicker'
import { getRecentFiles, clearRecentFiles } from '@/lib/recent-files'

type MenuAction =
  | { separator: true; label?: never; shortcut?: never; action?: never; disabled?: never; submenu?: never }
  | { label: string; shortcut?: string; action?: () => void; separator?: false; disabled?: boolean; submenu?: React.ReactNode }

interface Menu {
  label: string
  items: MenuAction[]
}

function MenuBarItem({
  menu,
  isOpen,
  onOpen,
  onClose,
  onHover,
}: {
  menu: Menu
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onHover: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      const dropdown = menuRef.current?.querySelector('.menubar-dropdown')
      if (!dropdown) return
      const items = Array.from(dropdown.querySelectorAll<HTMLButtonElement>('.menubar-dropdown-item:not([disabled])'))
      const idx = items.indexOf(document.activeElement as HTMLButtonElement)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        items[(idx + 1) % items.length]?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        items[(idx - 1 + items.length) % items.length]?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <div className="menubar-item" ref={menuRef}>
      <button
        className={`menubar-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => (isOpen ? onClose() : onOpen())}
        onMouseEnter={onHover}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {menu.label}
      </button>
      {isOpen && (
        <div className="menubar-dropdown" role="menu" aria-label={menu.label}>
          {menu.items.map((item, i) =>
            item.separator ? (
              <div key={i} className="menubar-separator" role="separator" />
            ) : item.submenu ? (
              <div key={i} className="menubar-submenu-wrapper">
                <button
                  className="menubar-dropdown-item menubar-has-submenu"
                  disabled={item.disabled}
                  role="menuitem"
                  aria-haspopup="true"
                >
                  <span className="menubar-dropdown-label">{item.label}</span>
                  <span className="menubar-submenu-arrow">▸</span>
                </button>
                <div className="menubar-submenu" role="menu">{item.submenu}</div>
              </div>
            ) : (
              <button
                key={i}
                className="menubar-dropdown-item"
                onClick={() => {
                  if (item.action && !item.disabled) {
                    item.action()
                    onClose()
                  }
                }}
                disabled={item.disabled}
                role="menuitem"
              >
                <span className="menubar-dropdown-label">{item.label}</span>
                {item.shortcut && (
                  <span className="menubar-dropdown-shortcut">{item.shortcut}</span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export function MenuBar({
  editor,
  onNew,
  onOpen,
  onOpenRecent,
  onSave,
  onSaveAs,
  onPrint,
  onExportPDF,
  onExportEPUB,
  onFind,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExtensions,
  onDictionary,
  onAssistant,
  onTranslator,
  onOutline,
  onWylieReference,
  onFocusMode,
  onTypewriterMode,
  onShortcuts,
  onWyliePractice,
  onAbout,
  focusMode,
  typewriterMode,
  readingMode,
  onReadingMode,
  fileName,
}: {
  editor: Editor | null
  onNew: () => void
  onOpen: () => void
  onOpenRecent: (path: string) => void
  onSave: () => void
  onSaveAs: () => void
  onPrint: () => void
  onExportPDF: () => void
  onExportEPUB: () => void
  onFind: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onExtensions: () => void
  onDictionary: () => void
  onAssistant: () => void
  onTranslator: () => void
  onOutline: () => void
  onWylieReference: () => void
  onFocusMode: () => void
  onTypewriterMode: () => void
  onShortcuts: () => void
  onWyliePractice: () => void
  onAbout: () => void
  focusMode: boolean
  typewriterMode: boolean
  readingMode: boolean
  onReadingMode: () => void
  fileName: string
}) {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const anyOpen = openMenu !== null

  const close = useCallback(() => setOpenMenu(null), [])

  const handleCut = useCallback(() => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from === to) return
    const slice = editor.state.doc.slice(from, to)
    const text = slice.content.textBetween(0, slice.content.size, '\n')
    navigator.clipboard.writeText(text)
    editor.chain().focus().deleteSelection().run()
  }, [editor])

  const handleCopy = useCallback(() => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from === to) return
    const slice = editor.state.doc.slice(from, to)
    const text = slice.content.textBetween(0, slice.content.size, '\n')
    navigator.clipboard.writeText(text)
  }, [editor])

  const handlePaste = useCallback(async () => {
    if (!editor) return
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        editor.chain().focus().insertContent(text).run()
      }
    } catch {
      editor.commands.focus()
    }
  }, [editor])

  const menus: Menu[] = useMemo(() => [
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: onNew },
        { label: 'Open...', shortcut: 'Ctrl+O', action: onOpen },
        {
          label: 'Open Recent',
          submenu: (() => {
            const files = getRecentFiles()
            if (files.length === 0) {
              return <button className="menubar-dropdown-item" disabled><span className="menubar-dropdown-label">No recent files</span></button>
            }
            return (
              <>
                {files.map((path, i) => (
                  <button key={i} className="menubar-dropdown-item" onClick={() => { onOpenRecent(path); close() }}>
                    <span className="menubar-dropdown-label">{path.split(/[\\/]/).pop()}</span>
                  </button>
                ))}
                <div className="menubar-separator" />
                <button className="menubar-dropdown-item" onClick={() => { clearRecentFiles(); close() }}>
                  <span className="menubar-dropdown-label">Clear Recent</span>
                </button>
              </>
            )
          })(),
        },
        { separator: true },
        { label: 'Save', shortcut: 'Ctrl+S', action: onSave },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: onSaveAs },
        { separator: true },
        { label: 'Export PDF', action: onExportPDF },
        { label: 'Export EPUB', action: onExportEPUB },
        { label: 'Print', shortcut: 'Ctrl+P', action: onPrint },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => editor?.chain().focus().undo().run() },
        { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => editor?.chain().focus().redo().run() },
        { separator: true },
        { label: 'Cut', shortcut: 'Ctrl+X', action: handleCut },
        { label: 'Copy', shortcut: 'Ctrl+C', action: handleCopy },
        { label: 'Paste', shortcut: 'Ctrl+V', action: handlePaste },
        { separator: true },
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => editor?.chain().focus().selectAll().run() },
        { separator: true },
        { label: 'Find & Replace', shortcut: 'Ctrl+F', action: onFind },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Zoom In', shortcut: 'Ctrl++', action: onZoomIn },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: onZoomOut },
        { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: onZoomReset },
        { separator: true },
        { label: `${focusMode ? '✓ ' : ''}Focus Mode`, shortcut: 'Ctrl+\\', action: onFocusMode },
        { label: `${typewriterMode ? '✓ ' : ''}Typewriter Mode`, action: onTypewriterMode },
        { label: `${readingMode ? '✓ ' : ''}Reading Mode`, action: onReadingMode },
        { separator: true },
        { label: 'Document Outline', action: onOutline },
        { label: 'Dictionary', action: onDictionary },
        { label: 'Assistant', action: onAssistant },
        { label: 'Translator', action: onTranslator },
        { separator: true },
        { label: 'Extensions', action: onExtensions },
      ],
    },
    {
      label: 'Insert',
      items: [
        { label: 'Image', action: () => editor?.chain().focus().setImageUploadNode().run() },
        { label: 'Horizontal Rule', action: () => editor?.chain().focus().setHorizontalRule().run() },
        { label: 'Page Break', shortcut: 'Ctrl+Enter', action: () => editor?.chain().focus().setPageBreak().run() },
        { label: 'Footnote', action: () => editor?.chain().focus().addFootnote().run() },
        { label: 'Code Block', action: () => editor?.chain().focus().toggleCodeBlock().run() },
        { separator: true },
        {
          label: 'Special Characters',
          submenu: (
            <div className="menubar-char-grid">
              {[
                { char: '—', label: 'Em dash' },
                { char: '–', label: 'En dash' },
                { char: '…', label: 'Ellipsis' },
                { char: '©', label: 'Copyright' },
                { char: '®', label: 'Registered' },
                { char: '™', label: 'Trademark' },
                { char: '°', label: 'Degree' },
                { char: '±', label: 'Plus-minus' },
                { char: '×', label: 'Multiplication' },
                { char: '÷', label: 'Division' },
                { char: '←', label: 'Left arrow' },
                { char: '→', label: 'Right arrow' },
                { char: '↑', label: 'Up arrow' },
                { char: '↓', label: 'Down arrow' },
                { char: '•', label: 'Bullet' },
                { char: '§', label: 'Section' },
                { char: '¶', label: 'Pilcrow' },
                { char: '†', label: 'Dagger' },
                { char: '‡', label: 'Double dagger' },
                { char: '⁂', label: 'Asterism' },
                { char: '༄', label: 'Tibetan initial mark' },
                { char: '༅', label: 'Tibetan closing mark' },
                { char: '༆', label: 'Tibetan caret' },
                { char: 'ༀ', label: 'Tibetan Om' },
                { char: '༔', label: 'Tibetan gter tsheg' },
                { char: '༑', label: 'Tibetan rin chen spungs shad' },
                { char: '༒', label: 'Tibetan nyis tsheg' },
                { char: '༗', label: 'Tibetan ku ru kha' },
                { char: '༼', label: 'Tibetan left brace' },
                { char: '༽', label: 'Tibetan right brace' },
              ].map((item) => (
                <button
                  key={item.char}
                  className="menubar-char-btn"
                  title={item.label}
                  onClick={() => {
                    editor?.chain().focus().insertContent(item.char).run()
                    close()
                  }}
                >
                  {item.char}
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      label: 'Format',
      items: [
        { label: 'Bold', shortcut: 'Ctrl+B', action: () => editor?.chain().focus().toggleBold().run() },
        { label: 'Italic', shortcut: 'Ctrl+I', action: () => editor?.chain().focus().toggleItalic().run() },
        { label: 'Underline', shortcut: 'Ctrl+U', action: () => editor?.chain().focus().toggleUnderline().run() },
        { label: 'Strikethrough', shortcut: 'Ctrl+Shift+X', action: () => editor?.chain().focus().toggleStrike().run() },
        { label: 'Superscript', action: () => editor?.chain().focus().toggleSuperscript().run() },
        { label: 'Subscript', action: () => editor?.chain().focus().toggleSubscript().run() },
        { separator: true },
        { label: 'Heading 1', shortcut: 'Ctrl+Alt+1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: 'Heading 2', shortcut: 'Ctrl+Alt+2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: 'Heading 3', shortcut: 'Ctrl+Alt+3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
        { separator: true },
        { label: 'Bullet List', action: () => editor?.chain().focus().toggleBulletList().run() },
        { label: 'Numbered List', action: () => editor?.chain().focus().toggleOrderedList().run() },
        { label: 'Blockquote', action: () => editor?.chain().focus().toggleBlockquote().run() },
        { separator: true },
        { label: 'Indent', shortcut: 'Tab', action: () => editor?.chain().focus().indent().run() },
        { label: 'Outdent', shortcut: 'Shift+Tab', action: () => editor?.chain().focus().outdent().run() },
        { separator: true },
        {
          label: 'Line Spacing',
          submenu: (
            <>
              {[
                { label: 'Single (1.0)', value: '1' },
                { label: '1.15', value: '1.15' },
                { label: '1.5', value: '1.5' },
                { label: 'Double (2.0)', value: '2' },
                { label: '2.5', value: '2.5' },
                { label: 'Triple (3.0)', value: '3' },
                { label: 'Default', value: '' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className="menubar-dropdown-item"
                  onClick={() => {
                    if (opt.value) {
                      editor?.chain().focus().setLineHeight(opt.value).run()
                    } else {
                      editor?.chain().focus().unsetLineHeight().run()
                    }
                    close()
                  }}
                >
                  <span className="menubar-dropdown-label">{opt.label}</span>
                </button>
              ))}
            </>
          ),
        },
        { separator: true },
        { label: 'Clear Formatting', action: () => editor?.chain().focus().unsetAllMarks().clearNodes().run() },
      ],
    },
    {
      label: 'Table',
      items: [
        {
          label: 'Insert Table',
          submenu: (
            <TableGridPicker
              onSelect={(rows, cols) => {
                editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
                close()
              }}
            />
          ),
        },
        { separator: true },
        { label: 'Add Row Above', action: () => editor?.chain().focus().addRowBefore().run(), disabled: !editor?.can().addRowBefore() },
        { label: 'Add Row Below', action: () => editor?.chain().focus().addRowAfter().run(), disabled: !editor?.can().addRowAfter() },
        { label: 'Delete Row', action: () => editor?.chain().focus().deleteRow().run(), disabled: !editor?.can().deleteRow() },
        { separator: true },
        { label: 'Add Column Left', action: () => editor?.chain().focus().addColumnBefore().run(), disabled: !editor?.can().addColumnBefore() },
        { label: 'Add Column Right', action: () => editor?.chain().focus().addColumnAfter().run(), disabled: !editor?.can().addColumnAfter() },
        { label: 'Delete Column', action: () => editor?.chain().focus().deleteColumn().run(), disabled: !editor?.can().deleteColumn() },
        { separator: true },
        { label: 'Merge Cells', action: () => editor?.chain().focus().mergeCells().run(), disabled: !editor?.can().mergeCells() },
        { label: 'Split Cell', action: () => editor?.chain().focus().splitCell().run(), disabled: !editor?.can().splitCell() },
        { separator: true },
        { label: 'Delete Table', action: () => editor?.chain().focus().deleteTable().run(), disabled: !editor?.can().deleteTable() },
      ],
    },
    {
      label: 'Help',
      items: [
        { label: 'Typing Tibetan (Practice)', action: onWyliePractice },
        { label: 'Wylie Reference', action: onWylieReference },
        { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+/', action: onShortcuts },
        { separator: true },
        { label: 'About TermaType', action: onAbout },
      ],
    },
  ], [editor, focusMode, typewriterMode, readingMode, close, handleCut, handleCopy, handlePaste,
      onNew, onOpen, onOpenRecent, onSave, onSaveAs, onPrint, onExportPDF, onExportEPUB, onFind,
      onZoomIn, onZoomOut, onZoomReset, onFocusMode, onTypewriterMode, onReadingMode,
      onExtensions, onDictionary, onAssistant, onTranslator, onOutline, onWylieReference, onShortcuts, onWyliePractice, onAbout])

  return (
    <div className="menubar">
      <div className="menubar-menus" role="menubar">
        {menus.map((menu, i) => (
          <MenuBarItem
            key={menu.label}
            menu={menu}
            isOpen={openMenu === i}
            onOpen={() => setOpenMenu(i)}
            onClose={close}
            onHover={() => {
              if (anyOpen) setOpenMenu(i)
            }}
          />
        ))}
      </div>
      <div className="menubar-title">{fileName}</div>
    </div>
  )
}
