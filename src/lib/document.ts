import { useState, useCallback, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import { newDocument, openFileDialog, openFilePath, saveFile, saveFileAsDialog } from './tauri'
import { addRecentFile } from './recent-files'
import { createSnapshot } from './version-history'

export interface DocumentState {
  filePath: string | null
  isDirty: boolean
  lastSaved: Date | null
  fileName: string
  autoSaveError: string | null
}

export function useDocument(editor: Editor | null) {
  const [state, setState] = useState<DocumentState>({
    filePath: null,
    isDirty: false,
    lastSaved: null,
    fileName: 'Untitled',
    autoSaveError: null,
  })
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (!editor) return

    const handler = () => {
      setState((prev) => ({ ...prev, isDirty: true }))
    }

    editor.on('update', handler)
    return () => {
      editor.off('update', handler)
    }
  }, [editor])

  const handleNew = useCallback(async () => {
    if (!editor) return
    const current = stateRef.current
    if (current.isDirty) {
      const ok = window.confirm('You have unsaved changes. Discard them?')
      if (!ok) return
    }
    const content = await newDocument()
    editor.commands.setContent(content)
    setState({
      filePath: null,
      isDirty: false,
      lastSaved: null,
      fileName: 'Untitled',
      autoSaveError: null,
    })
  }, [editor])

  const handleOpen = useCallback(async () => {
    if (!editor) return
    try {
      const result = await openFileDialog()
      if (!result) return

      editor.commands.setContent(result.content)
      const fileName = result.path
        ? result.path.split(/[\\/]/).pop() ?? 'Untitled'
        : 'Untitled'
      setState({
        filePath: result.path,
        isDirty: false,
        lastSaved: new Date(),
        fileName,
      })
      if (result.path) addRecentFile(result.path)
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }, [editor])

  const handleOpenPath = useCallback(async (path: string) => {
    if (!editor) return
    try {
      const result = await openFilePath(path)
      editor.commands.setContent(result.content)
      const fileName = path.split(/[\\/]/).pop() ?? 'Untitled'
      setState({
        filePath: path,
        isDirty: false,
        lastSaved: new Date(),
        fileName,
      })
      addRecentFile(path)
    } catch (err) {
      console.error('Failed to open file:', err)
    }
  }, [editor])

  const handleSaveAs = useCallback(async () => {
    if (!editor) return

    const content = editor.getJSON()
    try {
      const path = await saveFileAsDialog(content)
      if (!path) return

      const fileName = path.split(/[\\/]/).pop() ?? 'Untitled'
      setState({
        filePath: path,
        isDirty: false,
        lastSaved: new Date(),
        fileName,
      })
      addRecentFile(path)
    } catch (err) {
      console.error('Failed to save file:', err)
    }
  }, [editor])

  const handleSave = useCallback(async () => {
    if (!editor) return

    const content = editor.getJSON()
    const currentState = stateRef.current

    if (currentState.filePath) {
      try {
        await saveFile(currentState.filePath, content)
        createSnapshot(currentState.fileName, JSON.stringify(content), 'Manual save')
        setState((prev) => ({
          ...prev,
          isDirty: false,
          lastSaved: new Date(),
        }))
      } catch (err) {
        console.error('Failed to save file:', err)
      }
    } else {
      await handleSaveAs()
    }
  }, [editor, handleSaveAs])

  // Auto-save every 30 seconds if file has a path and is dirty
  useEffect(() => {
    if (!editor) return
    const interval = setInterval(() => {
      const current = stateRef.current
      if (current.filePath && current.isDirty) {
        const content = editor.getJSON()
        saveFile(current.filePath, content)
          .then(() => {
            setState((prev) => ({
              ...prev,
              isDirty: false,
              lastSaved: new Date(),
              autoSaveError: null,
            }))
          })
          .catch((e) => {
            setState((prev) => ({
              ...prev,
              autoSaveError: String(e),
            }))
          })
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [editor])

  // Warn before closing window with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (stateRef.current.isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  return {
    state,
    handleNew,
    handleOpen,
    handleOpenPath,
    handleSave,
    handleSaveAs,
  }
}
