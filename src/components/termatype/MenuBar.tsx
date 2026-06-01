import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Editor } from '@tiptap/react'
import { TableGridPicker } from './TableGridPicker'
import { getRecentFiles, clearRecentFiles } from '@/lib/recent-files'

export const TIBETAN_LABELS: Record<string, string> = {
  // Menu bar
  'File': 'ཡིག་ཆ།',
  'Edit': 'རྩོམ་སྒྲིག',
  'View': 'ལྟ་བཤེར།',
  'Insert': 'བསྒར་འཛུད།',
  'Format': 'རྣམ་གཞག',
  'Table': 'རེའུ་མིག',
  'Help': 'རོགས་རམ།',
  // File menu
  'New': 'གསར་བཟོ།',
  'Open...': 'ཁ་ཕྱེ།',
  'Open Recent': 'ཉེ་ལམ།',
  'No recent files': 'ཡིག་ཆ་མེད།',
  'Clear Recent': 'གཙང་བཟོ།',
  'Save': 'ཉར་ཚགས།',
  'Save As...': 'གཞན་ཉར།',
  'Export PDF': 'PDF ཕྱིར་འདོན།',
  'Export EPUB': 'EPUB ཕྱིར་འདོན།',
  'Print': 'པར་འདེབས།',
  // Edit menu
  'Undo': 'ཕྱིར་འཐེན།',
  'Redo': 'བསྐྱར་བྱེད།',
  'Cut': 'གཏུབ།',
  'Copy': 'ཕབ་བཤུས།',
  'Paste': 'སྦྱར།',
  'Select All': 'ཚང་མ་འདེམས།',
  'Find & Replace': 'འཚོལ་བརྗེ།',
  // View menu
  'Zoom In': 'ཆེ་རུ།',
  'Zoom Out': 'ཆུང་རུ།',
  'Reset Zoom': 'ཆེ་ཆུང་སོར་ཆུད།',
  'Focus Mode': 'དམིགས་གཏད།',
  'Typewriter Mode': 'ཡིག་འཕྲུལ།',
  'Reading Mode': 'ཀློག་ཐབས།',
  'Document Outline': 'ས་བཅད།',
  'Dictionary': 'ཚིག་མཛོད།',
  // Insert menu
  'Image': 'པར་རིས།',
  'Horizontal Rule': 'ཐིག་ཕྲེང་།',
  'Page Break': 'ཤོག་ངོས་གསར།',
  'Footnote': 'ཞབས་མཆན།',
  'Code Block': 'ཨང་རྟགས།',
  'Special Characters': 'ཡིག་རྟགས།',
  // Format menu
  'Bold': 'སྦོམ་པོ།',
  'Italic': 'གཡོན་འཁྱོག',
  'Underline': 'འོག་ཐིག',
  'Strikethrough': 'དཀྲོག་ཐིག',
  'Superscript': 'སྟེང་ཡིག',
  'Subscript': 'འོག་ཡིག',
  'Heading 1': 'མགོ་བྱང་ ༡',
  'Heading 2': 'མགོ་བྱང་ ༢',
  'Heading 3': 'མགོ་བྱང་ ༣',
  'Bullet List': 'རྩེ་རྟགས།',
  'Numbered List': 'ཨང་རིམ།',
  'Blockquote': 'དྲངས་ཚིག',
  'Indent': 'ནང་སྐུད།',
  'Outdent': 'ཕྱིར་སྐུད།',
  'Line Spacing': 'ཐིག་བར།',
  'Clear Formatting': 'རྣམ་གཞག་གཙང་བཟོ།',
  // Line spacing submenu
  'Single (1.0)': 'གཅིག (1.0)',
  'Double (2.0)': 'གཉིས (2.0)',
  'Default': 'སོར་བཞག',
  // Table menu
  'Insert Table': 'རེའུ་མིག་བསྒར།',
  'Add Row Above': 'སྟེང་ལ་སྟར།',
  'Add Row Below': 'འོག་ལ་སྟར།',
  'Delete Row': 'སྟར་སུབ།',
  'Add Column Left': 'གཡོན་ལ་སྟར།',
  'Add Column Right': 'གཡས་ལ་སྟར།',
  'Delete Column': 'སྟར་སུབ།',
  'Merge Cells': 'ཁང་མིག་སྡེབ།',
  'Split Cell': 'ཁང་མིག་གཏོར།',
  'Delete Table': 'རེའུ་མིག་སུབ།',
  // Help menu
  'Typing Tibetan (Practice)': 'བོད་ཡིག་སྦྱོང་བརྡར།',
  'Wylie Reference': 'ཝ་ལིའི་གཞུང་།',
  'Keyboard Shortcuts': 'མཐེབ་གནོན།',
  'About TermaType': 'གཏེར་མ་ཡིག་སྦྱོར་སྐོར།',
  // Dictionary sidebar
  'Tibetan-English Dictionary': 'བོད་དབྱིན་ཚིག་མཛོད།',
  'Search Tibetan or English...': 'བོད་ཡིག་གམ་དབྱིན་ཡིག་འཚོལ།',
  'Search': 'འཚོལ།',
  'Searching...': 'འཚོལ་བཞིན།',
  'No results found.': 'འབྲས་བུ་མ་རྙེད།',
  'Open Dictionary ›': 'ཚིག་མཛོད་ཁ་ཕྱེ། ›',
  // Status bar
  'words': 'ཚིག',
  'chars': 'ཡིག་འབྲུ',
  'min': 'སྐར་མ',
  'pg': 'ཤོག་ངོས',
  'Modified': 'བཟོ་བཅོས།',
  'Local': 'ས་གནས།',
  'Untitled': 'མིང་མེད།',
  'New document': 'ཡིག་ཆ་གསར་བཟོ།',
  'Saved just now': 'ད་ལྟ་ཉར་ཚགས།',
  'New document tab': 'ཡིག་ཆ་གསར་པ།',
}

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
  menuLang,
  onToggleMenuLang,
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
  menuLang: 'en' | 'bo'
  onToggleMenuLang: () => void
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
        { label: t('Typing Tibetan (Practice)'), action: onWyliePractice },
        { label: t('Wylie Reference'), action: onWylieReference },
        { label: t('Keyboard Shortcuts'), shortcut: 'Ctrl+/', action: onShortcuts },
        { separator: true },
        { label: t('About TermaType'), action: onAbout },
      ],
    },
  ], [t, editor, focusMode, typewriterMode, readingMode, close, handleCut, handleCopy, handlePaste,
      onNew, onOpen, onOpenRecent, onSave, onSaveAs, onPrint, onExportPDF, onExportEPUB, onFind,
      onZoomIn, onZoomOut, onZoomReset, onFocusMode, onTypewriterMode, onReadingMode,
      onDictionary, onOutline, onWylieReference, onShortcuts, onWyliePractice, onAbout])

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
        <div className="menubar-title">{fileName}</div>
        <button
          type="button"
          className={`menubar-lang-switch${menuLang === 'bo' ? ' active' : ''}`}
          onClick={onToggleMenuLang}
          title={menuLang === 'en' ? 'Toolbar Language / ལག་ཆའི་སྐད་ཡིག' : 'ལག་ཆའི་སྐད་ཡིག / Toolbar Language'}
          role="switch"
          aria-checked={menuLang === 'bo'}
        >
          <span className="menubar-lang-switch-label menubar-lang-en">EN</span>
          <span className="menubar-lang-switch-thumb" />
          <span className="menubar-lang-switch-label menubar-lang-bo">བོད</span>
        </button>
      </div>
    </div>
  )
}
