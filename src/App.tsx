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
import { TibetanSpellcheck } from '@/extensions/tibetan-spellcheck'
import { FindReplace, FindReplaceExtension } from '@/components/termatype/FindReplace'
import { SlashCommands } from '@/components/termatype/SlashCommands'
import { InlineDictionary } from '@/components/termatype/InlineDictionary'
import { PluginSettings } from '@/components/termatype/PluginSettings'
import { StatusBar } from '@/components/termatype/StatusBar'
import { VersionHistoryPanel } from '@/components/termatype/VersionHistoryPanel'
import { MainToolbarContent, MobileToolbarContent } from '@/components/termatype/ToolbarContent'

const DictionarySidebar = lazy(() => import('@/components/termatype/DictionarySidebar').then(m => ({ default: m.DictionarySidebar })))
const TermaAssistant = lazy(() => import('@/components/termatype/TermaAssistant').then(m => ({ default: m.TermaAssistant })))
const WylieReference = lazy(() => import('@/components/termatype/WylieReference').then(m => ({ default: m.WylieReference })))
const TermaTranslator = lazy(() => import('@/components/termatype/TermaTranslator').then(m => ({ default: m.TermaTranslator })))
const DocumentOutline = lazy(() => import('@/components/termatype/DocumentOutline').then(m => ({ default: m.DocumentOutline })))
const WyliePractice = lazy(() => import('@/components/termatype/WyliePractice').then(m => ({ default: m.WyliePractice })))
const KeyboardShortcutsPage = lazy(() => import('@/components/termatype/KeyboardShortcutsPage').then(m => ({ default: m.KeyboardShortcutsPage })))
const AboutPage = lazy(() => import('@/components/termatype/AboutPage').then(m => ({ default: m.AboutPage })))

type HelpTab = { id: string; label: string }
const HELP_TABS: Record<string, HelpTab> = {
  'wylie-practice': { id: 'wylie-practice', label: 'Typing Tibetan' },
  'wylie-reference': { id: 'wylie-reference', label: 'Wylie Reference' },
  'shortcuts': { id: 'shortcuts', label: 'Keyboard Shortcuts' },
  'about': { id: 'about', label: 'About TermaType' },
}

import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils'
import { useDocumentTabs } from '@/lib/document'
import { printDocument, exportPDF, exportEPUB } from '@/lib/print'

import { useIsBreakpoint } from '@/hooks/use-is-breakpoint'
import { useWindowSize } from '@/hooks/use-window-size'
import { useCursorVisibility } from '@/hooks/use-cursor-visibility'

import '@/components/tiptap-templates/simple/simple-editor.scss'

const lowlight = createLowlight(common)

const BLANK_DOC = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

const FIRST_LAUNCH_KEY = 'termatype-has-launched'

export default function App() {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>('main')
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [showPluginSettings, setShowPluginSettings] = useState(false)
  const [sidePanel, setSidePanel] = useState<{ open: boolean; tab: 'assistant' | 'dictionary' | 'translator' }>({ open: false, tab: 'assistant' })
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [lang, setLang] = useState<Lang>('en')
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [typewriterMode, setTypewriterMode] = useState(false)
  const [readingMode, setReadingMode] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [helpTabs, setHelpTabs] = useState<string[]>([])
  const [activeView, setActiveView] = useState<string>('document')
  const [closingTabId, setClosingTabId] = useState<string | null>(null)
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
      TibetanSpellcheck,
      SlashCommands,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error: Error) => console.error('Upload failed:', error),
      }),
    ],
    content: BLANK_DOC,
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

  const {
    tabs: docTabs, activeTab: activeDocTab, activeTabId: activeDocTabId,
    switchTab: switchDocTab, closeTab: closeDocTab,
    handleNew, handleOpen, handleOpenPath,
    handleSave, handleSaveAs, fileError, clearFileError,
  } = useDocumentTabs(editor)

  const openHelpTab = useCallback((tabId: string) => {
    setHelpTabs(prev => prev.includes(tabId) ? prev : [...prev, tabId])
    setActiveView(tabId)
  }, [])

  const closeHelpTab = useCallback((tabId: string) => {
    setHelpTabs(prev => prev.filter(t => t !== tabId))
    setActiveView(v => v === tabId ? 'document' : v)
  }, [])

  // Show About page on first launch only
  useEffect(() => {
    if (!localStorage.getItem(FIRST_LAUNCH_KEY)) {
      localStorage.setItem(FIRST_LAUNCH_KEY, '1')
      openHelpTab('about')
    }
  }, [openHelpTab])

  const activateDocTab = useCallback((tabId: string) => {
    switchDocTab(tabId)
    setActiveView('document')
  }, [switchDocTab])

  // Close tab with Save/Don't Save/Cancel dialog for dirty tabs
  const closingTab = closingTabId ? docTabs.find(t => t.id === closingTabId) ?? null : null

  // Use refs to avoid stale closure — isDirty must always reflect latest state
  const docTabsRef = useRef(docTabs)
  docTabsRef.current = docTabs
  const activeDocTabIdRef = useRef(activeDocTabId)
  activeDocTabIdRef.current = activeDocTabId

  const requestCloseDocTab = useCallback((tabId: string) => {
    const tab = docTabsRef.current.find(t => t.id === tabId)
    if (!tab) return
    if (tab.isDirty) {
      // Switch to the tab so save operates on it
      if (tabId !== activeDocTabIdRef.current) activateDocTab(tabId)
      setClosingTabId(tabId)
    } else {
      closeDocTab(tabId)
    }
  }, [activateDocTab, closeDocTab])

  const handleSaveAndClose = useCallback(async () => {
    if (!closingTabId) return
    const saved = await handleSave()
    if (saved) closeDocTab(closingTabId)
    setClosingTabId(null)
  }, [closingTabId, handleSave, closeDocTab])

  const handleDontSaveAndClose = useCallback(() => {
    if (closingTabId) closeDocTab(closingTabId)
    setClosingTabId(null)
  }, [closingTabId, closeDocTab])

  const handleCancelClose = useCallback(() => {
    setClosingTabId(null)
  }, [])

  // Wrap file operations to switch to document view
  const onNew = useCallback(async () => { await handleNew(); setActiveView('document') }, [handleNew])
  const onOpen = useCallback(async () => { await handleOpen(); setActiveView('document') }, [handleOpen])
  const onOpenPath = useCallback(async (path: string) => { await handleOpenPath(path); setActiveView('document') }, [handleOpenPath])

  const handlePrint = useCallback(() => { printDocument() }, [])
  const handleExportPDF = useCallback(() => { exportPDF(activeDocTab.fileName) }, [activeDocTab.fileName])
  const handleExportEPUB = useCallback(() => { exportEPUB(activeDocTab.fileName) }, [activeDocTab.fileName])

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

      if (e.key === 'n' && !e.shiftKey) { e.preventDefault(); onNew() }
      else if (e.key === 'o' && !e.shiftKey) { e.preventDefault(); onOpen() }
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
      else if (e.key === '/' || e.key === '?') { e.preventDefault(); openHelpTab('shortcuts') }
      else if (e.key === '\\') { e.preventDefault(); setFocusMode((v) => !v) }
    },
    [onNew, onOpen, handleSave, handleSaveAs, handlePrint, editor, openHelpTab]
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
          onNew={onNew}
          onOpen={onOpen}
          onOpenRecent={onOpenPath}
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
          onTranslator={() => setSidePanel((s) => s.open && s.tab === 'translator' ? { ...s, open: false } : { open: true, tab: 'translator' })}
          onOutline={() => setOutlineOpen(o => !o)}
          onWylieReference={() => openHelpTab('wylie-reference')}
          onFocusMode={() => setFocusMode((v) => !v)}
          onTypewriterMode={() => setTypewriterMode((v) => !v)}
          onReadingMode={() => setReadingMode((v) => !v)}
          readingMode={readingMode}
          onShortcuts={() => openHelpTab('shortcuts')}
          onWyliePractice={() => openHelpTab('wylie-practice')}
          onAbout={() => openHelpTab('about')}
          focusMode={focusMode}
          typewriterMode={typewriterMode}
          fileName={activeDocTab.fileName}
        />
        </nav>

        <div className="tab-bar" role="tablist">
          {docTabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-bar-tab${activeView === 'document' && activeDocTabId === tab.id ? ' active' : ''}`}
              onClick={() => activateDocTab(tab.id)}
              role="tab"
              aria-selected={activeView === 'document' && activeDocTabId === tab.id}
            >
              {tab.isDirty && <span className="tab-dirty-dot">● </span>}
              {tab.fileName}
              <span
                className="tab-bar-close"
                onClick={(e) => { e.stopPropagation(); requestCloseDocTab(tab.id) }}
                aria-label={`Close ${tab.fileName}`}
              >×</span>
            </button>
          ))}
          {helpTabs.map(tabId => (
            <button
              key={tabId}
              className={`tab-bar-tab tab-bar-tab-help${activeView === tabId ? ' active' : ''}`}
              onClick={() => setActiveView(tabId)}
              role="tab"
              aria-selected={activeView === tabId}
            >
              {HELP_TABS[tabId]?.label ?? tabId}
              <span
                className="tab-bar-close"
                onClick={(e) => { e.stopPropagation(); closeHelpTab(tabId) }}
                aria-label={`Close ${HELP_TABS[tabId]?.label}`}
              >×</span>
            </button>
          ))}
          <button type="button" className="tab-bar-new" onClick={onNew} title="New document" aria-label="New document">+</button>
        </div>

        <div className="termatype-app-with-sidebar" style={{ display: activeView === 'document' ? '' : 'none' }}>
          {outlineOpen && (
            <aside className="outline-panel" aria-label="Document outline">
              <div className="outline-panel-header">
                <span className="outline-panel-title">Outline</span>
                <button type="button" className="outline-panel-close" onClick={() => setOutlineOpen(false)} aria-label="Close outline">×</button>
              </div>
              <Suspense fallback={<div style={{ padding: '1rem', opacity: 0.5 }}>Loading...</div>}>
                <DocumentOutline editor={editor} />
              </Suspense>
            </aside>
          )}
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
            {editor && <InlineDictionary editor={editor} />}
          </div>

          {sidePanel.open && (
            <aside className="side-panel" aria-label="Tools panel">
              <div className="side-panel-tabs">
                <button type="button" className={`side-panel-tab${sidePanel.tab === 'assistant' ? ' active' : ''}`} onClick={() => setSidePanel((s) => ({ ...s, tab: 'assistant' }))}>Assistant</button>
                <button type="button" className={`side-panel-tab${sidePanel.tab === 'dictionary' ? ' active' : ''}`} onClick={() => setSidePanel((s) => ({ ...s, tab: 'dictionary' }))}>Dictionary</button>
                <button type="button" className={`side-panel-tab${sidePanel.tab === 'translator' ? ' active' : ''}`} onClick={() => setSidePanel((s) => ({ ...s, tab: 'translator' }))}>Translator</button>
                <button type="button" className="side-panel-close" onClick={() => setSidePanel((s) => ({ ...s, open: false }))} aria-label="Close panel">×</button>
              </div>
              <div className="side-panel-content">
                <Suspense fallback={<div style={{ padding: '1rem', opacity: 0.5 }}>Loading...</div>}>
                  {sidePanel.tab === 'dictionary' && <DictionarySidebar editor={editor} onClose={() => setSidePanel((s) => ({ ...s, open: false }))} />}
                  {sidePanel.tab === 'assistant' && <TermaAssistant editor={editor} onClose={() => setSidePanel((s) => ({ ...s, open: false }))} />}
                  {sidePanel.tab === 'translator' && <TermaTranslator editor={editor} onClose={() => setSidePanel((s) => ({ ...s, open: false }))} />}
                </Suspense>
              </div>
            </aside>
          )}
        </div>
      {activeView !== 'document' && (
        <div className="help-tab-content">
          <Suspense fallback={<div style={{ padding: '2rem', opacity: 0.5 }}>Loading...</div>}>
            {activeView === 'wylie-practice' && <WyliePractice />}
            {activeView === 'wylie-reference' && <WylieReference />}
            {activeView === 'shortcuts' && <KeyboardShortcutsPage />}
            {activeView === 'about' && <AboutPage />}
          </Suspense>
        </div>
      )}

      </EditorContext.Provider>

      {!outlineOpen && (
        <button type="button" className="outline-fab" onClick={() => setOutlineOpen(true)} aria-label="Open document outline" title="Document Outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="18" y2="18" />
          </svg>
        </button>
      )}

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
        fileName={activeDocTab.fileName}
        isDirty={activeDocTab.isDirty}
        lastSaved={activeDocTab.lastSaved}
        autoSaveError={activeDocTab.autoSaveError}
        zoom={zoom}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {focusMode && (
        <button
          className="focus-mode-hint"
          onClick={() => setFocusMode(false)}
          tabIndex={0}
          aria-label="Exit focus mode"
        >
          Focus Mode · Ctrl+\ to exit
        </button>
      )}

      {readingMode && (
        <button className="reading-mode-exit" onClick={() => setReadingMode(false)}>
          Exit Reading Mode
        </button>
      )}

      {showPluginSettings && <PluginSettings onClose={() => setShowPluginSettings(false)} />}

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
          fileName={activeDocTab.fileName}
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

      {fileError && (
        <div className="file-error-toast" onClick={clearFileError}>
          {fileError}
          <button onClick={clearFileError}>✕</button>
        </div>
      )}

      {closingTab && (
        <div className="save-dialog-overlay" onClick={handleCancelClose}>
          <div className="save-dialog" onClick={(e) => e.stopPropagation()}>
            <p>Do you want to save changes to <strong>{closingTab.fileName}</strong>?</p>
            <p className="save-dialog-hint">Your changes will be lost if you don't save them.</p>
            <div className="save-dialog-actions">
              <button className="save-dialog-btn save-dialog-btn-secondary" onClick={handleDontSaveAndClose}>Don't Save</button>
              <div className="save-dialog-spacer" />
              <button className="save-dialog-btn save-dialog-btn-secondary" onClick={handleCancelClose}>Cancel</button>
              <button className="save-dialog-btn save-dialog-btn-primary" onClick={handleSaveAndClose}>Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
