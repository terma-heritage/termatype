import { useState, useEffect, useCallback, useRef } from 'react'
import { invoke } from '@/lib/safe-invoke'
import { listen } from '@tauri-apps/api/event'
import type { Editor } from '@tiptap/react'

type TranslationDirection = 'bo_to_en' | 'en_to_bo'

interface SystemInfo {
  total_ram_gb: number
  available_ram_gb: number
  can_run_translator: boolean
  reason: string | null
}

function isMostlyTibetan(text: string): boolean {
  const nonSpace = text.replace(/\s/g, '')
  if (!nonSpace.length) return false
  const tibetanChars = (nonSpace.match(/[ༀ-࿿]/g) || []).length
  return tibetanChars / nonSpace.length > 0.5
}

export function TermaTranslator({
  editor,
  onClose,
}: {
  editor: Editor | null
  onClose: () => void
}) {
  const [installed, setInstalled] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [canRun, setCanRun] = useState<boolean | null>(null)
  const [cantRunReason, setCantRunReason] = useState<string | null>(null)
  const [direction, setDirection] = useState<TranslationDirection>('bo_to_en')
  const [translationResult, setTranslationResult] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const selectionRef = useRef<{ from: number; to: number } | null>(null)

  useEffect(() => {
    invoke<boolean>('get_plugin_status', { pluginId: 'terma-translator' })
      .then((status) => setInstalled(status))
      .catch(() => {})
  }, [])

  useEffect(() => {
    invoke<SystemInfo>('get_system_info')
      .then((info) => {
        setCanRun(info.can_run_translator)
        setCantRunReason(info.reason)
      })
      .catch(() => setCanRun(true))
  }, [])

  useEffect(() => {
    let mounted = true
    const unlisteners: (() => void)[] = []

    listen<{ pluginId: string; progress: number }>('plugin-download-progress', (event) => {
      if (!mounted || event.payload.pluginId !== 'terma-translator') return
      setDownloadProgress(event.payload.progress)
    }).then((fn) => { if (mounted) unlisteners.push(fn); else fn() })

    listen<{ pluginId: string }>('plugin-installed', (event) => {
      if (!mounted || event.payload.pluginId !== 'terma-translator') return
      setDownloadProgress(null)
      setInstalled(true)
    }).then((fn) => { if (mounted) unlisteners.push(fn); else fn() })

    return () => {
      mounted = false
      unlisteners.forEach((fn) => fn())
    }
  }, [])

  const handleInstall = useCallback(async () => {
    setError(null)
    setDownloadProgress(0)
    try {
      await invoke('install_plugin', { pluginId: 'terma-translator' })
    } catch (e) {
      setError(String(e))
      setDownloadProgress(null)
    }
  }, [])

  const handleUninstall = useCallback(async () => {
    setError(null)
    try {
      await invoke('unload_translator')
      await invoke('uninstall_plugin', { pluginId: 'terma-translator' })
      setInstalled(false)
      setModelLoaded(false)
    } catch (e) {
      setError(String(e))
    }
  }, [])

  useEffect(() => {
    if (!installed) return
    invoke<{ loaded: boolean; loading: boolean }>('get_translator_state')
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
      await invoke('load_translator')
      setModelLoaded(true)
    } catch (e) {
      setError(String(e))
    }
    setModelLoading(false)
  }, [])

  useEffect(() => {
    if (installed && !modelLoaded && !modelLoading && canRun) {
      loadModel()
    }
  }, [installed, modelLoaded, modelLoading, canRun, loadModel])

  const translate = useCallback(async () => {
    if (!editor || !modelLoaded) return

    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    const text = hasSelection
      ? editor.state.doc.textBetween(from, to, ' ')
      : ''

    if (!text.trim()) {
      setError('Please select text to translate.')
      return
    }

    const detectedDirection: TranslationDirection = isMostlyTibetan(text) ? 'bo_to_en' : 'en_to_bo'
    setDirection(detectedDirection)

    setOriginalText(text)
    selectionRef.current = { from, to }
    setTranslating(true)
    setTranslationResult(null)
    setError(null)

    try {
      const result = await invoke<string>('translate_text', { text, direction: detectedDirection })
      setTranslationResult(result)
    } catch (e) {
      setError(String(e))
    }
    setTranslating(false)
  }, [editor, modelLoaded])

  const translateWithDirection = useCallback(async (dir: TranslationDirection) => {
    if (!editor || !modelLoaded) return

    const { from, to } = editor.state.selection
    const hasSelection = from !== to
    const text = hasSelection
      ? editor.state.doc.textBetween(from, to, ' ')
      : ''

    if (!text.trim()) {
      setError('Please select text to translate.')
      return
    }

    setDirection(dir)
    setOriginalText(text)
    selectionRef.current = { from, to }
    setTranslating(true)
    setTranslationResult(null)
    setError(null)

    try {
      const result = await invoke<string>('translate_text', { text, direction: dir })
      setTranslationResult(result)
    } catch (e) {
      setError(String(e))
    }
    setTranslating(false)
  }, [editor, modelLoaded])

  const applyTranslation = useCallback(() => {
    if (!editor || !translationResult || !selectionRef.current) return

    const { from, to } = selectionRef.current
    const docSize = editor.state.doc.content.size
    if (from > docSize || to > docSize) return
    const currentText = editor.state.doc.textBetween(from, to, ' ')
    if (currentText !== originalText) return

    const sanitized = translationResult
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, sanitized).run()

    setTranslationResult(null)
    setOriginalText('')
    selectionRef.current = null
  }, [editor, translationResult, originalText])

  const handleFallback = useCallback(async () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const text = from !== to ? editor.state.doc.textBetween(from, to, ' ') : ''
    if (text.trim()) {
      await navigator.clipboard.writeText(text)
    }
    invoke('open_external_url', { url: 'https://dharmamitra.org' }).catch(() => {})
  }, [editor])

  if (!installed) {
    return (
      <div className="translator-sidebar">
        <div className="translator-header">
          <h3>Terma Translator</h3>
          <button className="translator-close" onClick={onClose} aria-label="Close translator">&#x2715;</button>
        </div>
        <div className="translator-not-installed">
          {canRun === false ? (
            <>
              <p>Your system doesn't have enough memory to run the translator offline.</p>
              <p className="translator-note">{cantRunReason}</p>
              <button className="translator-btn translator-btn-fallback" onClick={handleFallback}>
                Open dharmamitra.org
              </button>
              <p className="translator-note">Selected text will be copied to your clipboard.</p>
            </>
          ) : downloadProgress !== null ? (
            <div className="plugin-inline-progress">
              <div className="plugin-progress">
                <div className="plugin-progress-bar" style={{ width: `${downloadProgress}%` }} />
                <span>{downloadProgress}%</span>
              </div>
              <p className="translator-note">Downloading translator model...</p>
              <p className="translator-note">You can continue using other features while this downloads. The download will continue in the background.</p>
              <p className="translator-note">This may take a while depending on your internet connection.</p>
            </div>
          ) : (
            <>
              <p>Translate between Tibetan and English — all offline.</p>
              <button className="translator-btn translator-btn-translate plugin-inline-install" onClick={handleInstall}>
                Install (~5.9 GB)
              </button>
              <p className="translator-note">Requires 12 GB+ RAM</p>
            </>
          )}
          {error && <div className="assistant-error" style={{ marginTop: '8px' }}>{error}</div>}
        </div>
        <div className="translator-credits">
          <p>Powered by <a href="https://dharmamitra.org" target="_blank" rel="noopener noreferrer">MITRA</a></p>
          <p>Sebastian Nehrdich &amp; Kurt Keutzer</p>
          <p>Berkeley AI Research (BAIR)</p>
          <p><a href="https://arxiv.org/abs/2601.06400" target="_blank" rel="noopener noreferrer">arXiv:2601.06400</a></p>
        </div>
      </div>
    )
  }

  return (
    <div className="translator-sidebar">
      <div className="translator-header">
        <h3>Terma Translator</h3>
        <button className="translator-close" onClick={onClose} aria-label="Close translator">&#x2715;</button>
      </div>

      <div className="translator-content">
        {modelLoading && (
          <div className="assistant-loading">
            <div className="assistant-spinner" />
            <span>Loading translator model...</span>
          </div>
        )}

        {error && <div className="assistant-error">{error}</div>}

        {modelLoaded && (
          <>
            <div className="translator-section">
              <div className="translator-direction">
                <button
                  className={`translator-dir-btn${direction === 'bo_to_en' ? ' active' : ''}`}
                  onClick={() => translateWithDirection('bo_to_en')}
                  disabled={translating}
                >
                  &#x0F56;&#x0F7C;&#x0F51; &rarr; EN
                </button>
                <button
                  className={`translator-dir-btn${direction === 'en_to_bo' ? ' active' : ''}`}
                  onClick={() => translateWithDirection('en_to_bo')}
                  disabled={translating}
                >
                  EN &rarr; &#x0F56;&#x0F7C;&#x0F51;
                </button>
              </div>
              <button
                className="translator-btn translator-btn-translate"
                onClick={translate}
                disabled={translating}
              >
                Translate Selection
              </button>
            </div>

            {translating && (
              <div className="assistant-section">
                <div className="assistant-section-loading">Translating...</div>
              </div>
            )}

            {translationResult && (
              <div className="assistant-section">
                <div className="rewrite-original">
                  <span className="rewrite-label">Original</span>
                  <span className={isMostlyTibetan(originalText) ? 'translator-tibetan-text' : ''}>
                    {originalText}
                  </span>
                </div>
                <div className="rewrite-result">
                  <span className="rewrite-label">Translation</span>
                  <span className={direction === 'en_to_bo' ? 'translator-tibetan-text' : ''}>
                    {translationResult}
                  </span>
                </div>
                <button className="assistant-btn assistant-btn-primary" onClick={applyTranslation}>
                  Replace Selection
                </button>
              </div>
            )}

            {!translationResult && !translating && (
              <div className="assistant-help">
                <p className="assistant-help-title">How to use</p>
                <ul className="assistant-help-list">
                  <li>Select text in the editor, then click <strong>Translate Selection</strong>.</li>
                  <li>Direction auto-detects from your text. Use the buttons above to override.</li>
                  <li>Click <strong>Replace Selection</strong> to swap the original with the translation.</li>
                </ul>
                <p className="assistant-help-hint">For best results, translate one or two sentences at a time. The 9B model runs on CPU, so translation may take 30–60 seconds.</p>
                <div className="assistant-privacy-note">
                  <p><strong>100% Private &amp; Local</strong></p>
                  <p>Translations run entirely on your computer using MITRA. Nothing is sent to the internet.</p>
                </div>
                <p className="assistant-help-hint">If you encounter any problems or bugs, please contact <strong>info@termafoundation.org</strong></p>
              </div>
            )}
          </>
        )}

        <div className="plugin-inline-uninstall-wrap">
          <button className="plugin-inline-uninstall" onClick={handleUninstall}>Uninstall</button>
        </div>

        <div className="translator-credits">
          <p>Powered by <a href="https://dharmamitra.org" target="_blank" rel="noopener noreferrer">MITRA</a></p>
          <p>Sebastian Nehrdich &amp; Kurt Keutzer</p>
          <p>Berkeley AI Research (BAIR)</p>
          <p><a href="https://arxiv.org/abs/2601.06400" target="_blank" rel="noopener noreferrer">arXiv:2601.06400</a></p>
        </div>
      </div>
    </div>
  )
}
