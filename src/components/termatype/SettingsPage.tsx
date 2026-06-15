import type { TibetanInputMethod } from './tibetan-ime'

interface SettingsPageProps {
  menuLang: 'en' | 'bo'
  onToggleMenuLang: () => void
  inputMethod: TibetanInputMethod
  onToggleInputMethod: () => void
}

/**
 * The single home for set-once preferences. Kept intentionally short — a monk
 * unfamiliar with software should grasp the whole screen at a glance.
 */
export function SettingsPage({
  menuLang,
  onToggleMenuLang,
  inputMethod,
  onToggleInputMethod,
}: SettingsPageProps) {
  const bo = menuLang === 'bo'

  return (
    <div className={`help-page settings-page${bo ? ' help-page-bo' : ''}`}>
      <div className="help-page-content">
        <h1>{bo ? 'སྒྲིག་འགོད།' : 'Settings'}</h1>

        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-title">{bo ? 'མཉེན་ཆས་ཀྱི་སྐད་ཡིག' : 'App language'}</div>
            <div className="settings-row-desc">
              {bo ? 'ཟུར་ཐོ་དང་ཨང་རྟགས་ཀྱི་སྐད་ཡིག' : 'The language of menus and labels.'}
            </div>
          </div>
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

        <div className="settings-row">
          <div className="settings-row-text">
            <div className="settings-row-title">{bo ? 'བོད་ཡིག་འགོད་ཐབས།' : 'Tibetan typing method'}</div>
            <div className="settings-row-desc">
              {bo
                ? 'ཝ་ལི། དབྱིན་ཡིག་སྒྲ་འབྲི། TCRC། བོད་ཀྱི་མཐེབ་གཞོང་གི་སྲོལ་རྒྱུན།'
                : 'Wylie — type Tibetan phonetically (bskyod → བསྐྱོད). TCRC — the standard Tibetan keyboard layout.'}
            </div>
          </div>
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
        </div>

        <p className="settings-hint">
          {bo
            ? 'བརྡ་ཆོས། འབྲི་བཞིན་པའི་སྐབས། ཤོག་ངོས་སྟེང་གི་རྟགས་སམ་ Ctrl+Space མནན་ནས་བོད་དབྱིན་བརྗེ།'
            : 'While writing, switch between Tibetan and English anytime with the chip on the page or Ctrl+Space.'}
        </p>
      </div>
    </div>
  )
}
