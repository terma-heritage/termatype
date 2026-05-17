import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'

import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Underline } from '@tiptap/extension-underline'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { Selection } from '@tiptap/extensions'
import { Focus } from '@tiptap/extension-focus'
import { FontSize } from '@/extensions/font-size'
import { Indent } from '@/extensions/indent'
import { LineHeight } from '@/extensions/line-height'
import { FontFamily } from '@tiptap/extension-font-family'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

import { Toolbar } from '@/components/tiptap-ui-primitive/toolbar'

import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension'
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'
import { PageBreak } from '@/components/tiptap-node/page-break-node/page-break-node-extension'
import { Footnotes, FootnoteReference, Footnote } from 'tiptap-footnotes'
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/page-break-node/page-break-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/image-node/image-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'
import '@/components/tiptap-node/table-node/table-node.scss'
import '@/components/tiptap-node/footnote-node/footnote-node.scss'

import { MenuBar } from '@/components/termatype/MenuBar'
import { SelectionBubbleMenu } from '@/components/termatype/SelectionBubbleMenu'
import { TableBubbleMenu, TableContextMenu } from '@/components/termatype/TableBubbleMenu'
import { EwtsKeyboard } from '@/components/termatype/EwtsKeyboard'
import { createLanguageToggleExtension, type Lang } from '@/components/termatype/LanguageToggle'
import { createTibetanIMEExtension } from '@/components/termatype/tibetan-ime/tibetan-ime-extension'
import { FindReplace, FindReplaceExtension } from '@/components/termatype/FindReplace'
import { PluginSettings } from '@/components/termatype/PluginSettings'
import { StatusBar } from '@/components/termatype/StatusBar'
import { KeyboardShortcutsPanel } from '@/components/termatype/KeyboardShortcutsPanel'
import { VersionHistoryPanel } from '@/components/termatype/VersionHistoryPanel'
import { MainToolbarContent, MobileToolbarContent } from '@/components/termatype/ToolbarContent'

const DictionarySidebar = lazy(() => import('@/components/termatype/DictionarySidebar').then(m => ({ default: m.DictionarySidebar })))
const TermaAssistant = lazy(() => import('@/components/termatype/TermaAssistant').then(m => ({ default: m.TermaAssistant })))
const WylieReference = lazy(() => import('@/components/termatype/WylieReference').then(m => ({ default: m.WylieReference })))
const WyliePractice = lazy(() => import('@/components/termatype/WyliePractice').then(m => ({ default: m.WyliePractice })))

import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils'
import { useDocument } from '@/lib/document'
import { printDocument, exportPDF, exportEPUB } from '@/lib/print'

import { useIsBreakpoint } from '@/hooks/use-is-breakpoint'
import { useWindowSize } from '@/hooks/use-window-size'
import { useCursorVisibility } from '@/hooks/use-cursor-visibility'

import '@/components/tiptap-templates/simple/simple-editor.scss'

const lowlight = createLowlight(common)

const WELCOME_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to TermaType' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'གཏེར་མ་ཡིག་སྦྱོར་' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'A beautiful writing app for English and ' },
        { type: 'text', text: 'བོད་ཡིག' },
        { type: 'text', text: ' Tibetan. Free and open source, forever.' },
      ],
    },
    { type: 'horizontalRule' },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Start typing' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Just click anywhere and write. Press ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'Ctrl+Space' },
        { type: 'text', text: ' to switch between English and Tibetan. The built-in Wylie keyboard lets you type Tibetan script using familiar roman keys.' },
      ],
    },
    { type: 'paragraph', content: [] },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'What you can do' }],
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Rich formatting' },
          { type: 'text', text: ' — headings, bold, italic, lists, tables, images, code blocks, and more' },
        ]}] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Tibetan dictionary' },
          { type: 'text', text: ' — look up words instantly from Rangjung Yeshe and Monlam (View → Dictionary)' },
        ]}] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'AI writing assistant' },
          { type: 'text', text: ' — select text and let AI help you fix, rewrite, or enhance your writing (View → Assistant)' },
        ]}] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Focus mode' },
          { type: 'text', text: ' — hide distractions and write with a clean, centered view (Ctrl+\\)' },
        ]}] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Print & export' },
          { type: 'text', text: ' — print your documents or export them as PDF with beautiful formatting' },
        ]}] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [
          { type: 'text', marks: [{ type: 'bold' }], text: 'Footnotes & page breaks' },
          { type: 'text', text: ' — add footnotes for references and page breaks for print layout (Insert menu)' },
        ]}] },
      ],
    },
    { type: 'paragraph', content: [] },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Keyboard shortcuts' }],
    },
    {
      type: 'table',
      content: [
        { type: 'tableRow', content: [
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Action' }] }] },
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Shortcut' }] }] },
        ] },
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Switch language' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'code' }], text: 'Ctrl+Space' }] }] },
        ] },
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Focus mode' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'code' }], text: 'Ctrl+\\' }] }] },
        ] },
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Find & replace' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'code' }], text: 'Ctrl+H' }] }] },
        ] },
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Insert page break' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'code' }], text: 'Ctrl+Enter' }] }] },
        ] },
        { type: 'tableRow', content: [
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'All shortcuts' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'code' }], text: 'Ctrl+/' }] }] },
        ] },
      ],
    },
    { type: 'paragraph', content: [] },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Typing in Tibetan' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Press ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'Ctrl+Space' },
        { type: 'text', text: ' to switch to Tibetan mode. TermaType uses the ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Wylie transliteration' },
        { type: 'text', text: ' system — you type romanized letters and they convert to Tibetan script automatically.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'For example, type ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'bkra shis bde legs' },
        { type: 'text', text: ' to get བཀྲ་ཤིས་བདེ་ལེགས། (Tashi Delek). The space bar inserts a tsheg (་) between syllables.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Open the ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Wylie reference' },
        { type: 'text', text: ' sidebar (View → Wylie) to see the full mapping of roman keys to Tibetan letters. Try it now — press ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'Ctrl+Space' },
        { type: 'text', text: ' and start typing!' },
      ],
    },
    { type: 'paragraph', content: [] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'italic' }], text: 'This is a new document. Start writing above, or go to File → New to begin fresh.' },
      ],
    },
  ],
}

export default function App() {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>('main')
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [showPluginSettings, setShowPluginSettings] = useState(false)
  const [sidePanel, setSidePanel] = useState<{ open: boolean; tab: 'assistant' | 'dictionary' | 'wylie' }>({ open: false, tab: 'assistant' })
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [lang, setLang] = useState<Lang>('en')
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [typewriterMode, setTypewriterMode] = useState(false)
  const [readingMode, setReadingMode] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showWyliePractice, setShowWyliePractice] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const langRef = useRef(lang)
  langRef.current = lang
  const toggleLang = useCallback(() => {
    const next = langRef.current === 'en' ? 'bo' : 'en'
    langRef.current = next
    setLang(next)
    if (next === 'bo') setShowKeyboard(true)
  }, [])
  const [languageToggleExt] = useState(() => createLanguageToggleExtension(toggleLang, () => langRef.current))
  const [tibetanIMEExt] = useState(() => createTibetanIMEExtension(() => langRef.current, toggleLang))

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'on',
        autocapitalize: 'off',
        spellcheck: 'true',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        codeBlock: false,
        underline: false,
        link: { openOnClick: false, enableClickSelection: true },
      }),
      HorizontalRule,
      PageBreak,
      Footnotes,
      FootnoteReference,
      Footnote,
      CodeBlockLowlight.configure({ lowlight }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Underline,
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      Indent,
      LineHeight,
      Selection,
      Focus.configure({ className: 'has-focus', mode: 'deepest' }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return `Heading ${node.attrs.level}`
          return langRef.current === 'bo'
            ? "བོད་ཡིག འབྲི། Ctrl+Space ལ་བརྡ་དེ་དབྱིན་ཡིག"
            : "Type here, Ctrl+Space for བོད་ཡིག..."
        },
      }),
      Table.configure({ resizable: true, handleWidth: 5, cellMinWidth: 50 }),
      TableRow,
      TableHeader,
      TableCell,
      languageToggleExt,
      tibetanIMEExt,
      FindReplaceExtension,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error: Error) => console.error('Upload failed:', error),
      }),
    ],
    content: WELCOME_CONTENT,
  })

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.view.dispatch(editor.state.tr)
    }
  }, [lang, editor])

  useEffect(() => {
    if (!editor || !typewriterMode) return
    const handleUpdate = () => {
      const { node } = editor.view.domAtPos(editor.state.selection.anchor)
      const el = node instanceof Element ? node : node.parentElement
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    editor.on('selectionUpdate', handleUpdate)
    return () => { editor.off('selectionUpdate', handleUpdate) }
  }, [editor, typewriterMode])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readingMode)
  }, [editor, readingMode])

  const { state: docState, handleNew, handleOpen, handleOpenPath, handleSave, handleSaveAs, clearFileError } = useDocument(editor)

  const handlePrint = useCallback(() => { printDocument() }, [])
  const handleExportPDF = useCallback(() => { exportPDF(docState.fileName) }, [docState.fileName])
  const handleExportEPUB = useCallback(() => { exportEPUB(docState.fileName) }, [docState.fileName])

  useEffect(() => {
    let unlisten: (() => void) | null = null
    import('@tauri-apps/api/event').then(({ listen }) => {
      listen<{ paths: string[] }>('tauri://drag-drop', (event) => {
        const path = event.payload.paths?.[0]
        if (path) handleOpenPath(path)
      }).then((fn) => { unlisten = fn })
    }).catch(() => {})
    return () => { unlisten?.() }
  }, [handleOpenPath])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return

      if (e.key === 'n' && !e.shiftKey) { e.preventDefault(); handleNew() }
      else if (e.key === 'o' && !e.shiftKey) { e.preventDefault(); handleOpen() }
      else if (e.key === 's' && !e.shiftKey) { e.preventDefault(); handleSave() }
      else if (e.key === 's' && e.shiftKey) { e.preventDefault(); handleSaveAs() }
      else if (e.key === 'p') { e.preventDefault(); handlePrint() }
      else if (e.key === 'f' || e.key === 'h') { e.preventDefault(); setShowFindReplace(true) }
      else if (e.key === 'k' && !e.shiftKey) {
        e.preventDefault()
        if (editor?.isActive('link')) editor.chain().focus().extendMarkRange('link').unsetLink().run()
        else setShowLinkInput(true)
      }
      else if (e.key === 'X' && e.shiftKey) { e.preventDefault(); editor?.chain().focus().toggleStrike().run() }
      else if (e.key === 'l' && !e.shiftKey && !e.altKey) { e.preventDefault(); editor?.chain().focus().setTextAlign('left').run() }
      else if (e.key === 'e' && !e.shiftKey) { e.preventDefault(); editor?.chain().focus().setTextAlign('center').run() }
      else if (e.key === 'r' && !e.shiftKey) { e.preventDefault(); editor?.chain().focus().setTextAlign('right').run() }
      else if (e.key === 'j' && !e.shiftKey) { e.preventDefault(); editor?.chain().focus().setTextAlign('justify').run() }
      else if (e.key === '=' || e.key === '+') { e.preventDefault(); setZoom((z) => Math.min(z + 10, 200)) }
      else if (e.key === '-') { e.preventDefault(); setZoom((z) => Math.max(z - 10, 50)) }
      else if (e.key === '0') { e.preventDefault(); setZoom(100) }
      else if (e.key === '/' || e.key === '?') { e.preventDefault(); setShowShortcuts((v) => !v) }
      else if (e.key === '\\') { e.preventDefault(); setFocusMode((v) => !v) }
    },
    [handleNew, handleOpen, handleSave, handleSaveAs, handlePrint, editor]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') setMobileView('main')
  }, [isMobile, mobileView])

  return (
    <div className={`termatype-app${focusMode ? ' focus-mode' : ''}${readingMode ? ' reading-mode' : ''}`}>
      <EditorContext.Provider value={{ editor }}>
        <nav aria-label="Menu bar">
        <MenuBar
          editor={editor}
          onNew={handleNew}
          onNewFromTemplate={(content) => { editor?.commands.setContent(content) }}
          onOpen={handleOpen}
          onOpenRecent={handleOpenPath}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onHistory={() => setShowHistory(true)}
          onPrint={handlePrint}
          onExportPDF={handleExportPDF}
          onExportEPUB={handleExportEPUB}
          onFind={() => setShowFindReplace(true)}
          onZoomIn={() => setZoom((z) => Math.min(z + 10, 200))}
          onZoomOut={() => setZoom((z) => Math.max(z - 10, 50))}
          onZoomReset={() => setZoom(100)}
          onExtensions={() => setShowPluginSettings(true)}
          onDictionary={() => setSidePanel((s) => s.open && s.tab === 'dictionary' ? { ...s, open: false } : { open: true, tab: 'dictionary' })}
          onAssistant={() => setSidePanel((s) => s.open && s.tab === 'assistant' ? { ...s, open: false } : { open: true, tab: 'assistant' })}
          onWylie={() => setSidePanel((s) => s.open && s.tab === 'wylie' ? { ...s, open: false } : { open: true, tab: 'wylie' })}
          onFocusMode={() => setFocusMode((v) => !v)}
          onTypewriterMode={() => setTypewriterMode((v) => !v)}
          onReadingMode={() => setReadingMode((v) => !v)}
          readingMode={readingMode}
          onShortcuts={() => setShowShortcuts((v) => !v)}
          onWyliePractice={() => setShowWyliePractice(true)}
          onAbout={() => setShowAbout(true)}
          focusMode={focusMode}
          typewriterMode={typewriterMode}
          fileName={docState.fileName}
        />
        </nav>

        <div className="termatype-app-with-sidebar">
          <div className="simple-editor-wrapper" style={{ position: 'relative' }}>
            {showFindReplace && editor && (
              <FindReplace editor={editor} onClose={() => setShowFindReplace(false)} />
            )}
            <Toolbar
              ref={toolbarRef}
              style={{
                ...(isMobile ? { bottom: `calc(100% - ${height - rect.y}px)` } : {}),
              }}
            >
              {mobileView === 'main' ? (
                <MainToolbarContent
                  onHighlighterClick={() => setMobileView('highlighter')}
                  onLinkClick={() => setMobileView('link')}
                  isMobile={isMobile}
                />
              ) : (
                <MobileToolbarContent
                  type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                  onBack={() => setMobileView('main')}
                />
              )}
            </Toolbar>

            <EditorContent
              editor={editor}
              role="main"
              className={`simple-editor-content ${lang === 'bo' ? 'lang-bo' : 'lang-en'}${typewriterMode ? ' typewriter-mode' : ''}`}
              style={{ '--tt-zoom': zoom / 100 } as React.CSSProperties}
            />

            {editor && <SelectionBubbleMenu editor={editor} />}
            {editor && <TableBubbleMenu editor={editor} />}
            {editor && <TableContextMenu editor={editor} />}
          </div>

          {sidePanel.open && (
            <aside className="side-panel" aria-label="Tools panel">
              <div className="side-panel-tabs">
                <button type="button" className={`side-panel-tab${sidePanel.tab === 'assistant' ? ' active' : ''}`} onClick={() => setSidePanel((s) => ({ ...s, tab: 'assistant' }))}>Assistant</button>
                <button type="button" className={`side-panel-tab${sidePanel.tab === 'dictionary' ? ' active' : ''}`} onClick={() => setSidePanel((s) => ({ ...s, tab: 'dictionary' }))}>Dictionary</button>
                <button type="button" className={`side-panel-tab${sidePanel.tab === 'wylie' ? ' active' : ''}`} onClick={() => setSidePanel((s) => ({ ...s, tab: 'wylie' }))}>Wylie</button>
                <button type="button" className="side-panel-close" onClick={() => setSidePanel((s) => ({ ...s, open: false }))} aria-label="Close panel">×</button>
              </div>
              <div className="side-panel-content">
                <Suspense fallback={<div style={{ padding: '1rem', opacity: 0.5 }}>Loading...</div>}>
                  {sidePanel.tab === 'dictionary' && <DictionarySidebar editor={editor} onClose={() => setSidePanel((s) => ({ ...s, open: false }))} />}
                  {sidePanel.tab === 'assistant' && <TermaAssistant editor={editor} onClose={() => setSidePanel((s) => ({ ...s, open: false }))} />}
                  {sidePanel.tab === 'wylie' && <WylieReference />}
                </Suspense>
              </div>
            </aside>
          )}
        </div>
      </EditorContext.Provider>

      {!sidePanel.open && (
        <button type="button" className="side-panel-fab" onClick={() => setSidePanel((s) => ({ ...s, open: true }))} aria-label="Open tools panel" title="Tools Panel">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </button>
      )}

      {lang === 'bo' && showKeyboard && (
        <EwtsKeyboard editor={editor} onClose={() => setShowKeyboard(false)} />
      )}

      <StatusBar
        editor={editor}
        fileName={docState.fileName}
        isDirty={docState.isDirty}
        lastSaved={docState.lastSaved}
        autoSaveError={docState.autoSaveError}
        zoom={zoom}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {focusMode && (
        <div className="focus-mode-hint" onClick={() => setFocusMode(false)}>
          Focus Mode · Ctrl+\ to exit
        </div>
      )}

      {readingMode && (
        <button className="reading-mode-exit" onClick={() => setReadingMode(false)}>
          Exit Reading Mode
        </button>
      )}

      {showPluginSettings && <PluginSettings onClose={() => setShowPluginSettings(false)} />}
      {showShortcuts && <KeyboardShortcutsPanel onClose={() => setShowShortcuts(false)} />}

      {showLinkInput && (
        <div className="link-input-overlay" onClick={() => setShowLinkInput(false)}>
          <div className="link-input-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Insert Link</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const input = e.currentTarget.querySelector('input') as HTMLInputElement
              const url = input.value.trim()
              if (url && editor) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
              setShowLinkInput(false)
            }}>
              <input type="url" placeholder="https://example.com" autoFocus className="link-input-field" onKeyDown={(e) => { if (e.key === 'Escape') setShowLinkInput(false) }} />
              <div className="link-input-actions">
                <button type="button" className="link-input-btn" onClick={() => setShowLinkInput(false)}>Cancel</button>
                <button type="submit" className="link-input-btn link-input-btn-primary">Insert</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHistory && (
        <VersionHistoryPanel
          fileName={docState.fileName}
          onRestore={(content) => {
            try {
              const json = JSON.parse(content)
              editor?.commands.setContent(json)
            } catch {
              editor?.commands.setContent(content)
            }
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {docState.fileError && (
        <div className="file-error-toast" onClick={clearFileError}>
          {docState.fileError}
          <button onClick={clearFileError}>✕</button>
        </div>
      )}

      {showWyliePractice && (
        <Suspense fallback={null}>
          <WyliePractice onClose={() => setShowWyliePractice(false)} />
        </Suspense>
      )}

      {showAbout && (
        <div className="about-overlay" onClick={() => setShowAbout(false)}>
          <div className="about-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>TermaType</h2>
            <p className="about-tibetan">གཏེར་མ་ཡིག་སྦྱོར་</p>
            <p className="about-version">Version 0.1.0</p>
            <p className="about-tagline">Beautiful bilingual writing. Free forever.</p>
            <p className="about-license">MIT License</p>
            <button className="about-close-btn" onClick={() => setShowAbout(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
