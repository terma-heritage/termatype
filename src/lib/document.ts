import { useState, useCallback, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import { openFileDialog, openFilePath, saveFile, saveFileAsDialog } from './tauri'
import { addRecentFile } from './recent-files'
import { createSnapshot } from './version-history'

export interface DocTab {
  id: string
  fileName: string
  filePath: string | null
  content: any
  isDirty: boolean
  lastSaved: Date | null
  autoSaveError: string | null
}

let nextTabId = 1

// Extract a display name from editor JSON content (first heading or first text)
function deriveTitle(json: any): string {
  if (!json?.content?.length) return 'Untitled'
  for (const node of json.content) {
    // Prefer headings
    if (node.type === 'heading' && node.content?.length) {
      const text = node.content.map((c: any) => c.text ?? '').join('').trim()
      if (text) return text.length > 25 ? text.slice(0, 22) + '…' : text
    }
  }
  // Fall back to first paragraph with text
  for (const node of json.content) {
    if (node.type === 'paragraph' && node.content?.length) {
      const text = node.content.map((c: any) => c.text ?? '').join('').trim()
      if (text) return text.length > 25 ? text.slice(0, 22) + '…' : text
    }
  }
  return 'Untitled'
}

export function useDocumentTabs(editor: Editor | null) {
  const [tabs, setTabs] = useState<DocTab[]>([{
    id: 'doc-0',
    fileName: 'Untitled',
    filePath: null,
    content: null,
    isDirty: false,
    lastSaved: null,
    autoSaveError: null,
  }])
  const [activeTabId, setActiveTabId] = useState('doc-0')
  const suppressDirty = useRef(false)
  const tabsRef = useRef(tabs)
  tabsRef.current = tabs
  const activeIdRef = useRef(activeTabId)
  activeIdRef.current = activeTabId
  const [fileError, setFileError] = useState<string | null>(null)

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0]

  // Track dirty on editor updates + auto-name unsaved tabs (suppressed during content swaps)
  useEffect(() => {
    if (!editor) return
    const handler = () => {
      if (suppressDirty.current) return
      const json = editor.getJSON()
      setTabs(prev => prev.map(t => {
        if (t.id !== activeIdRef.current) return t
        const updates: Partial<DocTab> = { isDirty: true }
        // Auto-name only unsaved documents (no filePath)
        if (!t.filePath) {
          updates.fileName = deriveTitle(json)
        }
        return { ...t, ...updates }
      }))
    }
    editor.on('update', handler)
    return () => { editor.off('update', handler) }
  }, [editor])

  // Load content into editor without marking dirty
  const loadContent = useCallback((content: any) => {
    if (!editor) return
    suppressDirty.current = true
    editor.commands.setContent(content || '')
    suppressDirty.current = false
  }, [editor])

  // Save current editor JSON to the active tab's content field
  const snapshotActive = useCallback(() => {
    if (!editor) return
    const json = editor.getJSON()
    setTabs(prev => prev.map(t =>
      t.id === activeIdRef.current ? { ...t, content: json } : t
    ))
  }, [editor])

  // Switch document tab
  const switchTab = useCallback((newTabId: string) => {
    if (!editor || newTabId === activeIdRef.current) return
    const json = editor.getJSON()
    const newTab = tabsRef.current.find(t => t.id === newTabId)
    if (!newTab) return
    setTabs(prev => prev.map(t =>
      t.id === activeIdRef.current ? { ...t, content: json } : t
    ))
    loadContent(newTab.content)
    setActiveTabId(newTabId)
  }, [editor, loadContent])

  // File → New
  const handleNew = useCallback(() => {
    if (!editor) return
    snapshotActive()
    const id = `doc-${nextTabId++}`
    loadContent('')
    setTabs(prev => [...prev, {
      id, fileName: 'Untitled', filePath: null, content: null,
      isDirty: false, lastSaved: null, autoSaveError: null,
    }])
    setActiveTabId(id)
  }, [editor, snapshotActive, loadContent])

  // File → Open
  const handleOpen = useCallback(async () => {
    if (!editor) return
    try {
      const result = await openFileDialog()
      if (!result) return
      // If file already open, switch to its tab
      const existing = tabsRef.current.find(t => t.filePath && t.filePath === result.path)
      if (existing) {
        switchTab(existing.id)
        return
      }
      snapshotActive()
      const id = `doc-${nextTabId++}`
      const fileName = result.path ? result.path.split(/[\\/]/).pop() ?? 'Untitled' : 'Untitled'
      loadContent(result.content)
      setTabs(prev => [...prev, {
        id, fileName, filePath: result.path, content: result.content,
        isDirty: false, lastSaved: new Date(), autoSaveError: null,
      }])
      setActiveTabId(id)
      if (result.path) addRecentFile(result.path)
    } catch (err) {
      console.error('Failed to open file:', err)
      setFileError(`Failed to open file: ${err}`)
    }
  }, [editor, snapshotActive, loadContent, switchTab])

  // Open a specific file path (recent files, drag-drop)
  const handleOpenPath = useCallback(async (path: string) => {
    if (!editor) return
    try {
      const existing = tabsRef.current.find(t => t.filePath === path)
      if (existing) {
        switchTab(existing.id)
        return
      }
      const result = await openFilePath(path)
      snapshotActive()
      const id = `doc-${nextTabId++}`
      const fileName = path.split(/[\\/]/).pop() ?? 'Untitled'
      loadContent(result.content)
      setTabs(prev => [...prev, {
        id, fileName, filePath: path, content: result.content,
        isDirty: false, lastSaved: new Date(), autoSaveError: null,
      }])
      setActiveTabId(id)
      addRecentFile(path)
    } catch (err) {
      console.error('Failed to open file:', err)
      setFileError(`Failed to open file: ${err}`)
    }
  }, [editor, snapshotActive, loadContent, switchTab])

  // Save As — returns true if saved, false if cancelled/failed
  const handleSaveAs = useCallback(async (): Promise<boolean> => {
    if (!editor) return false
    const content = editor.getJSON()
    try {
      const path = await saveFileAsDialog(content)
      if (!path) return false
      const fileName = path.split(/[\\/]/).pop() ?? 'Untitled'
      setTabs(prev => prev.map(t =>
        t.id === activeIdRef.current
          ? { ...t, filePath: path, fileName, isDirty: false, lastSaved: new Date(), autoSaveError: null, content }
          : t
      ))
      addRecentFile(path)
      return true
    } catch (err) {
      console.error('Failed to save:', err)
      setFileError(`Failed to save: ${err}`)
      return false
    }
  }, [editor])

  // Save — returns true if saved, false if cancelled/failed
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!editor) return false
    const content = editor.getJSON()
    const tab = tabsRef.current.find(t => t.id === activeIdRef.current)
    if (!tab) return false
    if (tab.filePath) {
      try {
        await saveFile(tab.filePath, content)
        createSnapshot(tab.fileName, JSON.stringify(content), 'Manual save')
        setTabs(prev => prev.map(t =>
          t.id === activeIdRef.current
            ? { ...t, isDirty: false, lastSaved: new Date(), autoSaveError: null, content }
            : t
        ))
        return true
      } catch (err) {
        console.error('Failed to save:', err)
        setFileError(`Failed to save: ${err}`)
        return false
      }
    } else {
      return await handleSaveAs()
    }
  }, [editor, handleSaveAs])

  // Close tab (unconditional — caller handles dirty check)
  const closeTab = useCallback((tabId: string) => {
    const remaining = tabsRef.current.filter(t => t.id !== tabId)
    if (remaining.length === 0) {
      // Last tab — replace with fresh Untitled
      const id = `doc-${nextTabId++}`
      loadContent('')
      setTabs([{
        id, fileName: 'Untitled', filePath: null, content: null,
        isDirty: false, lastSaved: null, autoSaveError: null,
      }])
      setActiveTabId(id)
      return
    }
    if (activeIdRef.current === tabId) {
      const idx = tabsRef.current.findIndex(t => t.id === tabId)
      const nextTab = remaining[Math.min(idx, remaining.length - 1)]
      loadContent(nextTab.content)
      setActiveTabId(nextTab.id)
    }
    setTabs(remaining)
  }, [loadContent])

  // Auto-save active tab every 30 seconds
  useEffect(() => {
    if (!editor) return
    const interval = setInterval(() => {
      const tab = tabsRef.current.find(t => t.id === activeIdRef.current)
      if (tab?.filePath && tab.isDirty) {
        const content = editor.getJSON()
        saveFile(tab.filePath, content)
          .then(() => {
            setTabs(prev => prev.map(t =>
              t.id === tab.id ? { ...t, isDirty: false, lastSaved: new Date(), autoSaveError: null, content } : t
            ))
          })
          .catch((e) => {
            setTabs(prev => prev.map(t =>
              t.id === tab.id ? { ...t, autoSaveError: String(e) } : t
            ))
          })
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [editor])

  // Warn before closing if any tab is dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (tabsRef.current.some(t => t.isDirty)) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  const clearFileError = useCallback(() => setFileError(null), [])

  return {
    tabs,
    activeTab,
    activeTabId,
    switchTab,
    closeTab,
    handleNew,
    handleOpen,
    handleOpenPath,
    handleSave,
    handleSaveAs,
    fileError,
    clearFileError,
  }
}
