import { useState, useRef, useCallback } from 'react'
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

export function WyliePractice({ menuLang = 'en' }: { menuLang?: 'en' | 'bo' }) {
  const [input, setInput] = useState('')
  const [tibetanOutput, setTibetanOutput] = useState('')
  const engineRef = useRef(new WylieEngine())
  const bo = menuLang === 'bo'

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value
    setInput(raw)
    engineRef.current.reset()
    setTibetanOutput(wylieToTibetan(raw))
  }, [])

  return (
    <div className={`help-page${bo ? ' help-page-bo' : ''}`}>
      <div className="help-page-content">
        <h1>{bo ? 'ཝ་ལིའི་ཐབས་ཀྱིས་བོད་ཡིག་འབྲི་ཚུལ།' : 'Typing Tibetan with Wylie'}</h1>

        <p>
          {bo ? (
            <>གཏེར་མ་ཡིག་སྦྱོར་གྱིས་ <strong>ཝ་ལིའི་བསྒྱུར་བྱང་</strong> བཀོལ་ནས་བོད་ཡིག་འབྲི། ཝ་ལིས་བོད་ཡིག་གི་ཡི་གེ་རེ་རེ་དབྱིན་ཡིག་ཏུ་བསྒྱུར་བས། མཐེབ་གཞོང་དཀྱུས་མ་བཀོལ་ནས་བོད་ཡིག་འབྲི་ཐུབ། རྩོམ་སྒྲིག་ནང་ <code>Ctrl+Space</code> མནན་ནས་བོད་ཡིག་ཐབས་སུ་སྒྱུར།</>
          ) : (
            <>
              TermaType uses the <strong>Wylie transliteration</strong> system to type Tibetan.
              Wylie maps each Tibetan letter to roman characters, so you can type Tibetan with a
              standard keyboard — no special layout needed. Just press <code>Ctrl+Space</code> in
              the editor to switch to Tibetan mode and start typing.
            </>
          )}
        </p>

        <h2>{bo ? 'སྦྱོང་བརྡར་ཡིག་ཆ།' : 'Practice Text'}</h2>
        <p className="help-muted">
          {bo
            ? '༧གོང་ས་མཆོག་གི་ཞབས་བརྟན་གསོལ་འདེབས། གཡོན་ངོས་ཝ་ལི། གཡས་ངོས་བོད་ཡིག'
            : 'A prayer for the long life of His Holiness the Dalai Lama. The Wylie is shown on the left, and the Tibetan on the right.'}
        </p>

        <div className="practice-verses">
          {PRACTICE_LINES.map((line, i) => (
            <div key={i} className="practice-verse">
              <span className="practice-verse-wylie">{line.wylie}</span>
              <span className="practice-verse-tibetan">{line.tibetan}</span>
            </div>
          ))}
        </div>

        <h2>{bo ? 'ཚོད་ལྟ།' : 'Try it'}</h2>
        <p className="help-muted">
          {bo ? (
            <>སྟེང་གི་ཝ་ལིའི་ཡིག་ཆ་འོག་གི་སྒམ་ནང་བྲིས། བར་སྟོང་ནི་ཚེག (་) ཏུ་འགྱུར། / ནི་ཤད (།) ཏུ་འགྱུར།</>
          ) : (
            <>Type the Wylie text above into the box below. Spaces become tshegs (་) and <code>/</code> becomes a shad (།).</>
          )}
        </p>

        <div className="practice-tryit">
          <textarea
            className="practice-textarea"
            value={input}
            onChange={handleInput}
            placeholder={bo ? 'ཝ་ལི་འདིར་བྲིས།' : 'Type Wylie here...'}
            rows={4}
            spellCheck={false}
            autoComplete="off"
          />
          {tibetanOutput && (
            <div className="practice-result">
              {tibetanOutput}
            </div>
          )}
        </div>

        <div className="help-tip">
          {bo ? (
            <>
              <strong>བརྡ་ཆོས།</strong> རྩོམ་སྒྲིག་ནང་ <code>Ctrl+Space</code> མནན་ནས་དབྱིན་ཡིག་དང་བོད་ཡིག་བརྗེ། <strong>རོགས་རམ། → ཝ་ལིའི་གཞུང་།</strong> ནས་མཐེབ་གཞོང་གི་རྣམ་པ་ཚང་མ་ལྟ་ཐུབ།
            </>
          ) : (
            <>
              <strong>Tip:</strong> In the editor, press <code>Ctrl+Space</code> to switch between
              English and Tibetan. Open <strong>Help → Wylie Reference</strong> for the full
              key mapping.
            </>
          )}
        </div>
      </div>
    </div>
  )
}
