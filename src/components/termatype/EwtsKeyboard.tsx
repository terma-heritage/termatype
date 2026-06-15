import { Fragment, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { TIBETAN_MARK_GROUPS } from './tibetan-ime/tibetan-marks'

const KEYBOARD_ROWS = [
  [
    { wylie: 'k', tibetan: 'ཀ' },
    { wylie: 'kh', tibetan: 'ཁ' },
    { wylie: 'g', tibetan: 'ག' },
    { wylie: 'ng', tibetan: 'ང' },
    { wylie: 'c', tibetan: 'ཅ' },
    { wylie: 'ch', tibetan: 'ཆ' },
    { wylie: 'j', tibetan: 'ཇ' },
    { wylie: 'ny', tibetan: 'ཉ' },
    { wylie: 't', tibetan: 'ཏ' },
    { wylie: 'th', tibetan: 'ཐ' },
  ],
  [
    { wylie: 'd', tibetan: 'ད' },
    { wylie: 'n', tibetan: 'ན' },
    { wylie: 'p', tibetan: 'པ' },
    { wylie: 'ph', tibetan: 'ཕ' },
    { wylie: 'b', tibetan: 'བ' },
    { wylie: 'm', tibetan: 'མ' },
    { wylie: 'ts', tibetan: 'ཙ' },
    { wylie: 'tsh', tibetan: 'ཚ' },
    { wylie: 'dz', tibetan: 'ཛ' },
    { wylie: 'w', tibetan: 'ཝ' },
  ],
  [
    { wylie: 'zh', tibetan: 'ཞ' },
    { wylie: 'z', tibetan: 'ཟ' },
    { wylie: "'", tibetan: 'འ' },
    { wylie: 'y', tibetan: 'ཡ' },
    { wylie: 'r', tibetan: 'ར' },
    { wylie: 'l', tibetan: 'ལ' },
    { wylie: 'sh', tibetan: 'ཤ' },
    { wylie: 's', tibetan: 'ས' },
    { wylie: 'h', tibetan: 'ཧ' },
    { wylie: 'a', tibetan: 'ཨ' },
  ],
  [
    { wylie: 'i', tibetan: 'ི', label: 'i vowel' },
    { wylie: 'u', tibetan: 'ུ', label: 'u vowel' },
    { wylie: 'e', tibetan: 'ེ', label: 'e vowel' },
    { wylie: 'o', tibetan: 'ོ', label: 'o vowel' },
    { wylie: 'space', tibetan: '་', label: 'tsheg' },
    { wylie: '/', tibetan: '།', label: 'shad' },
    { wylie: '0-9', tibetan: '༠-༩', label: 'digits' },
  ],
]

interface EwtsKeyboardProps {
  onClose: () => void
  editor?: Editor | null
}

export function EwtsKeyboard({ onClose, editor }: EwtsKeyboardProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [view, setView] = useState<'letters' | 'symbols'>('letters')

  const insert = (char: string) => {
    if (editor) editor.chain().focus().insertContent(char).run()
  }

  return (
    <div className={`ewts-keyboard ${collapsed ? 'ewts-keyboard--collapsed' : ''}`}>
      <div className="ewts-keyboard__header">
        <span className="ewts-keyboard__title">EWTS Keyboard</span>
        <div className="ewts-keyboard__controls">
          <button
            className="ewts-keyboard__btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '▲' : '▼'}
          </button>
          <button
            className="ewts-keyboard__btn"
            onClick={onClose}
            title="Close keyboard"
          >
            ✕
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="ewts-keyboard__body">
          <div className="ewts-keyboard__tabs">
            <button
              className={`ewts-keyboard__tab ${view === 'letters' ? 'ewts-keyboard__tab--active' : ''}`}
              onClick={() => setView('letters')}
            >
              ཨ Letters
            </button>
            <button
              className={`ewts-keyboard__tab ${view === 'symbols' ? 'ewts-keyboard__tab--active' : ''}`}
              onClick={() => setView('symbols')}
            >
              ༸ Symbols
            </button>
          </div>

          {view === 'letters' ? (
            <>
              {KEYBOARD_ROWS.map((row, ri) => (
                <div key={ri} className="ewts-keyboard__row">
                  {row.map((key) => (
                    <button
                      type="button"
                      key={key.wylie}
                      className="ewts-keyboard__key"
                      title={'label' in key ? key.label : key.wylie}
                      onClick={() => {
                        if (key.tibetan.length === 1) insert(key.tibetan)
                      }}
                    >
                      <span className="ewts-keyboard__tibetan">{key.tibetan}</span>
                      <span className="ewts-keyboard__wylie">{key.wylie}</span>
                    </button>
                  ))}
                </div>
              ))}
              <div className="ewts-keyboard__hints">
                <span>Type Wylie → get Tibetan</span>
                <span>Space = tsheg ་</span>
                <span>. = syllable break</span>
                <span>/ = shad །</span>
                <span>Ctrl+Space = toggle lang</span>
              </div>
            </>
          ) : (
            <div className="ewts-keyboard__symbols">
              {TIBETAN_MARK_GROUPS.map((group) => (
                <Fragment key={group.category}>
                  <div className="ewts-keyboard__group">{group.category}</div>
                  <div className="ewts-keyboard__row ewts-keyboard__row--wrap">
                    {group.marks.map((mark) => (
                      <button
                        type="button"
                        key={mark.codepoint}
                        className="ewts-keyboard__key"
                        title={
                          mark.wylie
                            ? `${mark.label} — Wylie: ${mark.wylie}`
                            : `${mark.label} (${mark.codepoint})`
                        }
                        onClick={() => insert(mark.char)}
                      >
                        <span className="ewts-keyboard__tibetan">{mark.char}</span>
                        <span className="ewts-keyboard__wylie">{mark.wylie ?? '•'}</span>
                      </button>
                    ))}
                  </div>
                </Fragment>
              ))}
              <div className="ewts-keyboard__hints">
                <span>Marks EWTS can’t type by Wylie — click to insert</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
