import type { TibetanInputMethod } from './tibetan-ime'

interface WelcomeScreenProps {
  menuLang: 'en' | 'bo'
  onToggleMenuLang: () => void
  inputMethod: TibetanInputMethod
  onToggleInputMethod: () => void
  onDismiss: () => void
}

/**
 * First-launch welcome. One calm screen that sets the two choices in place
 * (reusing the Settings toggles) rather than sending the user hunting. "Start
 * writing" works with the defaults; the choices update live as they pick.
 */
export function WelcomeScreen({
  menuLang,
  onToggleMenuLang,
  inputMethod,
  onToggleInputMethod,
  onDismiss,
}: WelcomeScreenProps) {
  const bo = menuLang === 'bo'

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="welcome-card">
        <h1 className="welcome-title">
          {bo ? 'གཏེར་མ་ཡིག་སྦྱོར་ལ་ཕེབས་པར་དགའ་བསུ།' : 'Welcome to TermaType'}
        </h1>
        <p className="welcome-sub">
          {bo ? 'བོད་དང་དབྱིན་ཇིའི་ཡིག་ཆ་འབྲི་སའི་གནས།' : 'A calm place to write in Tibetan and English.'}
        </p>

        <div className="welcome-choice">
          <div className="welcome-choice-label">{bo ? 'མཉེན་ཆས་ཀྱི་སྐད་ཡིག' : 'App language'}</div>
          <div className="settings-seg" role="group" aria-label="App language">
            <button
              type="button"
              className={menuLang === 'en' ? 'active' : ''}
              onClick={() => { if (menuLang !== 'en') onToggleMenuLang() }}
            >
              English
            </button>
            <button
              type="button"
              className={menuLang === 'bo' ? 'active' : ''}
              onClick={() => { if (menuLang !== 'bo') onToggleMenuLang() }}
            >
              བོད་ཡིག
            </button>
          </div>
        </div>

        <div className="welcome-choice">
          <div className="welcome-choice-label">{bo ? 'བོད་ཡིག་འགོད་ཐབས།' : 'Type Tibetan with'}</div>
          <div className="settings-seg" role="group" aria-label="Tibetan typing method">
            <button
              type="button"
              className={inputMethod === 'wylie' ? 'active' : ''}
              onClick={() => { if (inputMethod !== 'wylie') onToggleInputMethod() }}
            >
              Wylie
            </button>
            <button
              type="button"
              className={inputMethod === 'tcrc' ? 'active' : ''}
              onClick={() => { if (inputMethod !== 'tcrc') onToggleInputMethod() }}
            >
              TCRC
            </button>
          </div>
          <div className="welcome-method-hint">
            {inputMethod === 'tcrc'
              ? (bo ? 'TCRC — བོད་ཀྱི་མཐེབ་གཞོང་སྲོལ་རྒྱུན། (CTA)' : 'TCRC — the standard Tibetan keyboard layout (CTA / exile).')
              : (bo ? 'ཝ་ལི — དབྱིན་ཡིག་སྒྲ་ཡིས་འབྲི། (bskyod → བསྐྱོད)' : 'Wylie — type Tibetan phonetically (bskyod → བསྐྱོད).')}
          </div>
        </div>

        <button type="button" className="welcome-start" onClick={onDismiss}>
          {bo ? 'འགོ་འཛུགས།' : 'Start writing'}
        </button>
        <div className="welcome-foot">
          {bo ? 'སྒྲིག་འགོད་ ⚙ ནས་ནམ་ཡང་བསྒྱུར་ཆོག' : 'You can change these anytime in Settings ⚙'}
        </div>
      </div>
    </div>
  )
}
