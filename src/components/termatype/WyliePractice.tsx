import { useState, useRef, useCallback, useEffect } from 'react'
import { WylieEngine } from './tibetan-ime/wylie-engine'

const PRACTICE_LINES = [
  { wylie: "gangs ri rwa bas bskor ba'i zhing khams su/", tibetan: 'གངས་རི་རྭ་བས་བསྐོར་བའི་ཞིང་ཁམས་སུ།' },
  { wylie: "phan dang bde ba ma lus 'byung ba'i gnas/", tibetan: 'ཕན་དང་བདེ་བ་མ་ལུས་འབྱུང་བའི་གནས།' },
  { wylie: "spyan ras gzigs dbang bstan 'dzin rgya mtsho yi/", tibetan: 'སྤྱན་རས་གཟིགས་དབང་བསྟན་འཛིན་རྒྱ་མཚོ་ཡི།' },
  { wylie: "zhabs pad bskal brgya'i bar du brtan gyur cig/", tibetan: 'ཞབས་པད་བསྐལ་བརྒྱའི་བར་དུ་བརྟན་གྱུར་ཅིག།' },
]

function wylieToTibetan(wylie: string): string {
  const engine = new WylieEngine()
  let result = ''
  for (const ch of wylie) {
    if (ch === ' ') {
      const flushed = engine.flush()
      result += flushed.committed + '་'
      continue
    }
    const out = engine.feed(ch)
    result += out.committed
  }
  const final = engine.flush()
  result += final.committed
  return result
}

function PracticeLine({ line, index }: { line: typeof PRACTICE_LINES[0]; index: number }) {
  const [input, setInput] = useState('')
  const [tibetanOutput, setTibetanOutput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const engineRef = useRef(new WylieEngine())

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInput(raw)
    engineRef.current.reset()
    const converted = wylieToTibetan(raw)
    setTibetanOutput(converted)
  }, [])

  const isCorrect = tibetanOutput.length > 0 && line.tibetan.startsWith(tibetanOutput)
  const isComplete = tibetanOutput === line.tibetan

  return (
    <div className={`practice-line${isComplete ? ' complete' : ''}`}>
      <div className="practice-number">{index + 1}</div>
      <div className="practice-content">
        <div className="practice-wylie">{line.wylie}</div>
        <div className="practice-target">{line.tibetan}</div>
        <div className="practice-input-row">
          <input
            ref={inputRef}
            type="text"
            className={`practice-input${tibetanOutput.length > 0 ? (isCorrect ? ' correct' : ' incorrect') : ''}`}
            value={input}
            onChange={handleInput}
            placeholder="Type the Wylie here..."
            spellCheck={false}
            autoComplete="off"
          />
          {isComplete && <span className="practice-check">&#10003;</span>}
        </div>
        {tibetanOutput && (
          <div className={`practice-output${isCorrect ? ' correct' : ' incorrect'}`}>
            {tibetanOutput}
          </div>
        )}
      </div>
    </div>
  )
}

export function WyliePractice({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="wylie-practice-overlay" onClick={onClose}>
      <div className="wylie-practice-panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <div className="wylie-practice-header">
          <h2>Typing Tibetan with Wylie</h2>
          <button className="wylie-practice-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="wylie-practice-body">
          <div className="wylie-practice-intro">
            <p>
              TermaType uses the <strong>Wylie transliteration</strong> system to type Tibetan.
              Wylie maps Tibetan letters to roman characters, so you can type Tibetan using a
              standard keyboard — no special keyboard layout needed.
            </p>
            <p>
              <strong>How it works:</strong> Type roman letters and they are automatically
              converted to Tibetan script. The space bar inserts a tsheg (་) syllable separator.
              Type <code>/</code> for a shad (།).
            </p>
          </div>

          <h3>Practice</h3>
          <p className="wylie-practice-instruction">
            Type the Wylie text below into each input field. Your input will be converted to
            Tibetan in real-time. Try to match the target Tibetan text.
          </p>

          <div className="practice-lines">
            {PRACTICE_LINES.map((line, i) => (
              <PracticeLine key={i} line={line} index={i} />
            ))}
          </div>

          <div className="wylie-practice-tip">
            <strong>Tip:</strong> In the editor, press <code>Ctrl+Space</code> to switch between
            English and Tibetan mode. Open <strong>View → Wylie Reference</strong> for the full
            mapping of roman keys to Tibetan letters.
          </div>
        </div>
      </div>
    </div>
  )
}
