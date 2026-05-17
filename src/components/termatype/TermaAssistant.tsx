import { useState, useEffect, useCallback, useRef } from 'react'
import { invoke } from '@/lib/safe-invoke'
import type { Editor } from '@tiptap/react'

type TransformMode = 'fix' | 'rewrite' | 'enhance'

const TRANSFORM_MODES: { mode: TransformMode; label: string }[] = [
  { mode: 'fix', label: 'Fix' },
  { mode: 'rewrite', label: 'Rewrite' },
  { mode: 'enhance', label: 'Enhance' },
]

export function TermaAssistant({
  editor,
  onClose,
}: {
  editor: Editor | null
  onClose: () => void
}) {
  const [installed, setInstalled] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [polishResult, setPolishResult] = useState<string | null>(null)
  const [polishLoading, setPolishLoading] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [isWholeDoc, setIsWholeDoc] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectionRef = useRef<{ from: number; to: number } | null>(null)

  useEffect(() => {
    invoke<boolean>('get_plugin_status', { pluginId: 'terma-assistant' })
      .then((status) => setInstalled(status))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!installed) return
    invoke<{ loaded: boolean; loading: boolean }>('get_assistant_state')
      .then((state) => {
        setModelLoaded(state.loaded)
        setModelLoading(state.loading)
      })
      .catch(() => {})
  }, [installed])

  const loadModel = useCallback(async () => {
    setModelLoading(true)
    setError(null)
    try {
      await invoke('load_assistant')
      setModelLoaded(true)
    } catch (e) {
      setError(String(e))
    }
    setModelLoading(false)
  }, [])

  useEffect(() => {
    if (installed && !modelLoaded && !modelLoading) {
      loadModel()
    }
  }, [installed, modelLoaded, modelLoading, loadModel])

  const polish = useCallback(async (mode: TransformMode) => {
    if (!editor || !modelLoaded) return

    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    const text = hasSelection
      ? editor.state.doc.textBetween(from, to, ' ')
      : editor.state.doc.textContent

    if (!text.trim()) return

    setOriginalText(text)
    setIsWholeDoc(!hasSelection)
    selectionRef.current = hasSelection ? { from, to } : null
    setPolishLoading(true)
    setPolishResult(null)
    setError(null)

    try {
      const result = await invoke<string>('transform_text', { text, mode })
      setPolishResult(result)
    } catch (e) {
      setError(String(e))
    }
    setPolishLoading(false)
  }, [editor, modelLoaded])

  const applyPolish = useCallback(() => {
    if (!editor || !polishResult) return

    const sanitized = polishResult
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    if (isWholeDoc) {
      const paragraphs = sanitized.split('\n').filter(Boolean).map(p => `<p>${p}</p>`).join('')
      editor.commands.setContent(paragraphs || `<p>${sanitized}</p>`)
    } else if (selectionRef.current) {
      const { from, to } = selectionRef.current
      const docSize = editor.state.doc.content.size
      if (from > docSize || to > docSize) return
      const currentText = editor.state.doc.textBetween(from, to, ' ')
      if (currentText !== originalText) return
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, sanitized).run()
    }

    setPolishResult(null)
    setOriginalText('')
    setIsWholeDoc(false)
    selectionRef.current = null
  }, [editor, polishResult, isWholeDoc])

  if (!installed) {
    return (
      <div className="assistant-sidebar">
        <div className="assistant-header">
          <h3>Terma Assistant</h3>
          <button className="assistant-close" onClick={onClose} aria-label="Close assistant">✕</button>
        </div>
        <div className="assistant-not-installed">
          <p>Terma Assistant is not installed.</p>
          <p>Go to <strong>View → Extensions</strong> to install.</p>
          <p className="assistant-note">Requires ~800 MB download (Gemma 3 model)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="assistant-sidebar">
      <div className="assistant-header">
        <h3>Terma Assistant</h3>
        <button className="assistant-close" onClick={onClose} aria-label="Close assistant">✕</button>
      </div>

      <div className="assistant-content">
        {modelLoading && (
          <div className="assistant-loading">
            <div className="assistant-spinner" />
            <span>Loading model...</span>
          </div>
        )}

        {error && <div className="assistant-error">{error}</div>}

        {modelLoaded && (
          <>
            <div className="assistant-section">
              <div className="assistant-transform-actions">
                {TRANSFORM_MODES.map(({ mode, label }) => (
                  <button
                    key={mode}
                    className="assistant-btn"
                    onClick={() => polish(mode)}
                    disabled={polishLoading}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {polishLoading && (
              <div className="assistant-section">
                <div className="assistant-section-loading">
                  {isWholeDoc ? 'Polishing entire document...' : 'Polishing selection...'}
                </div>
              </div>
            )}

            {polishResult && (
              <div className="assistant-section">
                <div className="rewrite-original">
                  <span className="rewrite-label">Original</span>
                  {originalText}
                </div>
                <div className="rewrite-result">
                  <span className="rewrite-label">Result</span>
                  {polishResult}
                </div>
                <button className="assistant-btn assistant-btn-primary" onClick={applyPolish}>
                  Apply
                </button>
              </div>
            )}

            {!polishResult && !polishLoading && (
              <div className="assistant-help">
                <p className="assistant-help-title">How to use</p>
                <ul className="assistant-help-list">
                  <li><strong>Fix</strong> — corrects grammar, spelling, and punctuation. Doesn't change your words.</li>
                  <li><strong>Rewrite</strong> — rephrases your text while keeping the same meaning. Good for brain dumps.</li>
                  <li><strong>Enhance</strong> — adds minor detail and smooth transitions to flesh out your writing.</li>
                </ul>
                <p className="assistant-help-hint">Select text first, or press a button with no selection to process the whole document.</p>
                <div className="assistant-privacy-note">
                  <p><strong>100% Private &amp; Local</strong></p>
                  <p>This AI runs entirely on your computer. Your text never leaves your device and nothing is sent to the internet. Processing speed depends on your hardware.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
