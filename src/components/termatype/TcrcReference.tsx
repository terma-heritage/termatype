import { TCRC_KEYMAP, type TcrcKind } from './tibetan-ime'

interface TcrcReferenceProps {
  menuLang?: 'en' | 'bo'
}

const KEY_DISPLAY: Record<string, string> = { ' ': 'Space' }
const showKey = (k: string) => KEY_DISPLAY[k] ?? k

function keysOfKind(...kinds: TcrcKind[]) {
  return Object.entries(TCRC_KEYMAP).filter(([, v]) => kinds.includes(v.kind))
}

export function TcrcReference({ menuLang = 'en' }: TcrcReferenceProps) {
  const bo = menuLang === 'bo'

  const consonants = keysOfKind('consonant')
  const vowels = keysOfKind('vowel')
  const marks = keysOfKind('mark', 'digit')

  return (
    <div className={`help-page${bo ? ' help-page-bo' : ''}`}>
      <div className="help-page-content">
        <h1>{bo ? 'TCRC མཐེབ་གཞོང་།' : 'TCRC Reference'}</h1>

        <section className="wylie-ref-section">
          <h4>{bo ? 'ལག་ལེན་ཇི་ལྟར།' : 'How It Works'}</h4>
          <p>{bo
            ? <>TCRC ནི་གནས་ཀྱི་མཐེབ་གཞོང་ཡིན། མཐེབ་རེ་རེ་ལ་བོད་ཡིག་གི་ཡི་གེ་ངེས་ཅན་རེ་ཡོད། <kbd>Ctrl+Space</kbd> མནན་ནས་དབྱིན་བོད་བརྗེ།</>
            : <>TCRC is a <strong>positional</strong> keyboard — each key maps to a fixed Tibetan letter (it is not phonetic like Wylie). Press <kbd>Ctrl+Space</kbd> to switch between English and Tibetan.</>
          }</p>
        </section>

        <section className="wylie-ref-section">
          <h4>{bo ? 'གསལ་བྱེད།' : 'Consonants'}</h4>
          <div className="wylie-ref-grid">
            {consonants.map(([key, v]) => (
              <span key={key} title={v.label}>{showKey(key)} {v.out}</span>
            ))}
          </div>
        </section>

        <section className="wylie-ref-section">
          <h4>{bo ? 'དབྱངས།' : 'Vowels'}</h4>
          <div className="wylie-ref-grid cols-3">
            {vowels.map(([key, v]) => (
              <span key={key} title={v.label}>{showKey(key)} {v.out}</span>
            ))}
          </div>
        </section>

        <section className="wylie-ref-section">
          <h4>{bo ? 'བརྩེགས་ཀྱི་ཚུལ།' : 'Stacking (halant)'}</h4>
          <p>{bo
            ? <>མཐེབ་ <kbd>a</kbd> (Link) ནི་འོག་ཏུ་འཇུག་བྱེད་ཡིན། གསལ་བྱེད་གཉིས་ཀྱི་བར་དུ་བྲིས་ན་གཉིས་པ་འོག་ཏུ་འགྱུར།</>
            : <>The <kbd>a</kbd> key (Link / halant) is a dead key: type it between two consonants and the second becomes subjoined. <kbd>,</kbd> = yatag (ྱ), <kbd>.</kbd> = ratag (ྲ).</>
          }</p>
          <div className="wylie-ref-examples">
            <div><kbd>k a y</kbd> → ཀྱ</div>
            <div><kbd>b s a k a y o d</kbd> → བསྐྱོད</div>
          </div>
        </section>

        <section className="wylie-ref-section">
          <h4>{bo ? 'བར་སྟོང་དང་ཡིག་རྟགས།' : 'Spacing & Punctuation'}</h4>
          <table className="wylie-ref-table">
            <tbody>
              <tr><td><kbd>Space</kbd></td><td>Tsheg ་ (syllable separator)</td></tr>
              <tr><td><kbd>Space Space</kbd></td><td>Real space (after tsheg)</td></tr>
              <tr><td><kbd>/</kbd></td><td>Shad །  (auto-tsheg after ང)</td></tr>
            </tbody>
          </table>
          <div className="wylie-ref-grid cols-3" style={{ marginTop: '0.75rem' }}>
            {marks.filter(([k]) => k !== '/').map(([key, v]) => (
              <span key={key} title={v.label}>{showKey(key)} {v.out}</span>
            ))}
          </div>
        </section>

        <p className="help-muted">
          {bo
            ? 'ཟུར་བརྗོད། མཐེབ་འགའ་ཤས་ (ཨང་ཆེན་གྱི་གསལ་བྱེད་སོགས) ད་དུང་ཞིབ་བཤེར་དགོས།'
            : 'Note: a few keys (Sanskrit aspirates and rarer marks) are still being confirmed against the official TCRC chart.'}
        </p>
      </div>
    </div>
  )
}
