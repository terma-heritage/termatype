import { Fragment, useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Editor } from '@tiptap/react'
import { TableGridPicker } from './TableGridPicker'
import { TIBETAN_MARK_GROUPS } from './tibetan-ime/tibetan-marks'
import { TIBETAN_LABELS } from './tibetan-labels'
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
  onDictionary,
  onOutline,
  onFocusMode,
  onTypewriterMode,
  onHelp,
  onAbout,
  focusMode,
  typewriterMode,
  readingMode,
  onReadingMode,
  menuLang,
  onOpenSettings,
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
  onDictionary: () => void
  onOutline: () => void
  onFocusMode: () => void
  onTypewriterMode: () => void
  onHelp: () => void
  onAbout: () => void
  focusMode: boolean
  typewriterMode: boolean
  readingMode: boolean
  onReadingMode: () => void
  menuLang: 'en' | 'bo'
  onOpenSettings: () => void
}) {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const anyOpen = openMenu !== null

  const t = useCallback((label: string) => menuLang === 'bo' ? (TIBETAN_LABELS[label] || label) : label, [menuLang])
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
      label: t('File'),
      items: [
        { label: t('New'), shortcut: 'Ctrl+N', action: onNew },
        { label: t('Open...'), shortcut: 'Ctrl+O', action: onOpen },
        {
          label: t('Open Recent'),
          submenu: (() => {
            const files = getRecentFiles()
            if (files.length === 0) {
              return <button className="menubar-dropdown-item" disabled><span className="menubar-dropdown-label">{t('No recent files')}</span></button>
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
                  <span className="menubar-dropdown-label">{t('Clear Recent')}</span>
                </button>
              </>
            )
          })(),
        },
        { separator: true },
        { label: t('Save'), shortcut: 'Ctrl+S', action: onSave },
        { label: t('Save As...'), shortcut: 'Ctrl+Shift+S', action: onSaveAs },
        { separator: true },
        { label: t('Export PDF'), action: onExportPDF },
        { label: t('Export EPUB'), action: onExportEPUB },
        { label: t('Print'), shortcut: 'Ctrl+P', action: onPrint },
      ],
    },
    {
      label: t('Edit'),
      items: [
        { label: t('Undo'), shortcut: 'Ctrl+Z', action: () => editor?.chain().focus().undo().run() },
        { label: t('Redo'), shortcut: 'Ctrl+Shift+Z', action: () => editor?.chain().focus().redo().run() },
        { separator: true },
        { label: t('Cut'), shortcut: 'Ctrl+X', action: handleCut },
        { label: t('Copy'), shortcut: 'Ctrl+C', action: handleCopy },
        { label: t('Paste'), shortcut: 'Ctrl+V', action: handlePaste },
        { separator: true },
        { label: t('Select All'), shortcut: 'Ctrl+A', action: () => editor?.chain().focus().selectAll().run() },
        { separator: true },
        { label: t('Find & Replace'), shortcut: 'Ctrl+F', action: onFind },
      ],
    },
    {
      label: t('View'),
      items: [
        { label: t('Zoom In'), shortcut: 'Ctrl++', action: onZoomIn },
        { label: t('Zoom Out'), shortcut: 'Ctrl+-', action: onZoomOut },
        { label: t('Reset Zoom'), shortcut: 'Ctrl+0', action: onZoomReset },
        { separator: true },
        { label: `${focusMode ? '✓ ' : ''}${t('Focus Mode')}`, shortcut: 'Ctrl+\\', action: onFocusMode },
        { label: `${typewriterMode ? '✓ ' : ''}${t('Typewriter Mode')}`, action: onTypewriterMode },
        { label: `${readingMode ? '✓ ' : ''}${t('Reading Mode')}`, action: onReadingMode },
        { separator: true },
        { label: t('Document Outline'), action: onOutline },
        { label: t('Dictionary'), action: onDictionary },
      ],
    },
    {
      label: t('Insert'),
      items: [
        { label: t('Image'), action: () => editor?.chain().focus().setImageUploadNode().run() },
        { label: t('Horizontal Rule'), action: () => editor?.chain().focus().setHorizontalRule().run() },
        { label: t('Page Break'), shortcut: 'Ctrl+Enter', action: () => editor?.chain().focus().setPageBreak().run() },
        { label: t('Footnote'), action: () => editor?.chain().focus().addFootnote().run() },
        { label: t('Code Block'), action: () => editor?.chain().focus().toggleCodeBlock().run() },
        { separator: true },
        {
          label: t('Special Characters'),
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
              {TIBETAN_MARK_GROUPS.map((group) => (
                <Fragment key={group.category}>
                  <div className="menubar-char-heading">{group.category}</div>
                  {group.marks.map((mark) => (
                    <button
                      key={mark.codepoint}
                      className="menubar-char-btn"
                      title={
                        mark.wylie
                          ? `${mark.label} — Wylie: ${mark.wylie}`
                          : `${mark.label} (${mark.codepoint})`
                      }
                      onClick={() => {
                        editor?.chain().focus().insertContent(mark.char).run()
                        close()
                      }}
                    >
                      {mark.char}
                    </button>
                  ))}
                </Fragment>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      label: t('Format'),
      items: [
        { label: t('Bold'), shortcut: 'Ctrl+B', action: () => editor?.chain().focus().toggleBold().run() },
        { label: t('Italic'), shortcut: 'Ctrl+I', action: () => editor?.chain().focus().toggleItalic().run() },
        { label: t('Underline'), shortcut: 'Ctrl+U', action: () => editor?.chain().focus().toggleUnderline().run() },
        { label: t('Strikethrough'), shortcut: 'Ctrl+Shift+X', action: () => editor?.chain().focus().toggleStrike().run() },
        { label: t('Superscript'), action: () => editor?.chain().focus().toggleSuperscript().run() },
        { label: t('Subscript'), action: () => editor?.chain().focus().toggleSubscript().run() },
        { separator: true },
        { label: t('Heading 1'), shortcut: 'Ctrl+Alt+1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: t('Heading 2'), shortcut: 'Ctrl+Alt+2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: t('Heading 3'), shortcut: 'Ctrl+Alt+3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
        { separator: true },
        { label: t('Bullet List'), action: () => editor?.chain().focus().toggleBulletList().run() },
        { label: t('Numbered List'), action: () => editor?.chain().focus().toggleOrderedList().run() },
        { label: t('Blockquote'), action: () => editor?.chain().focus().toggleBlockquote().run() },
        { separator: true },
        { label: t('Indent'), shortcut: 'Tab', action: () => editor?.chain().focus().indent().run() },
        { label: t('Outdent'), shortcut: 'Shift+Tab', action: () => editor?.chain().focus().outdent().run() },
        { separator: true },
        {
          label: t('Line Spacing'),
          submenu: (
            <>
              {[
                { label: t('Single (1.0)'), value: '1' },
                { label: '1.15', value: '1.15' },
                { label: '1.5', value: '1.5' },
                { label: t('Double (2.0)'), value: '2' },
                { label: '2.5', value: '2.5' },
                { label: 'Triple (3.0)', value: '3' },
                { label: t('Default'), value: '' },
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
        { label: t('Clear Formatting'), action: () => editor?.chain().focus().unsetAllMarks().clearNodes().run() },
      ],
    },
    {
      label: t('Table'),
      items: [
        {
          label: t('Insert Table'),
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
        { label: t('Add Row Above'), action: () => editor?.chain().focus().addRowBefore().run(), disabled: !editor?.can().addRowBefore() },
        { label: t('Add Row Below'), action: () => editor?.chain().focus().addRowAfter().run(), disabled: !editor?.can().addRowAfter() },
        { label: t('Delete Row'), action: () => editor?.chain().focus().deleteRow().run(), disabled: !editor?.can().deleteRow() },
        { separator: true },
        { label: t('Add Column Left'), action: () => editor?.chain().focus().addColumnBefore().run(), disabled: !editor?.can().addColumnBefore() },
        { label: t('Add Column Right'), action: () => editor?.chain().focus().addColumnAfter().run(), disabled: !editor?.can().addColumnAfter() },
        { label: t('Delete Column'), action: () => editor?.chain().focus().deleteColumn().run(), disabled: !editor?.can().deleteColumn() },
        { separator: true },
        { label: t('Merge Cells'), action: () => editor?.chain().focus().mergeCells().run(), disabled: !editor?.can().mergeCells() },
        { label: t('Split Cell'), action: () => editor?.chain().focus().splitCell().run(), disabled: !editor?.can().splitCell() },
        { separator: true },
        { label: t('Delete Table'), action: () => editor?.chain().focus().deleteTable().run(), disabled: !editor?.can().deleteTable() },
      ],
    },
    {
      label: t('Help'),
      items: [
        { label: t('Help & FAQ'), action: onHelp },
        { separator: true },
        { label: t('About TermaType'), action: onAbout },
      ],
    },
  ], [t, editor, focusMode, typewriterMode, readingMode, close, handleCut, handleCopy, handlePaste,
      onNew, onOpen, onOpenRecent, onSave, onSaveAs, onPrint, onExportPDF, onExportEPUB, onFind,
      onZoomIn, onZoomOut, onZoomReset, onFocusMode, onTypewriterMode, onReadingMode,
      onDictionary, onOutline, onHelp, onAbout])

  return (
    <div className={`menubar${menuLang === 'bo' ? ' menubar-tibetan' : ''}`}>
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
      <div className="menubar-right">
        <button
          type="button"
          className="menubar-settings-btn"
          onClick={onOpenSettings}
          title={menuLang === 'bo' ? 'སྒྲིག་འགོད།' : 'Settings'}
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
