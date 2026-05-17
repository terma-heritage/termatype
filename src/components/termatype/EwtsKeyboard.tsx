import { useState } from 'react'
import type { Editor } from '@tiptap/react'

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
    { wylie: '.', tibetan: '།', label: 'shad' },
    { wylie: '0-9', tibetan: '༠-༩', label: 'digits' },
  ],
]

interface EwtsKeyboardProps {
  onClose: () => void
  editor?: Editor | null
}

export function EwtsKeyboard({ onClose, editor }: EwtsKeyboardProps) {
  const [collapsed, setCollapsed] = useState(false)

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
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="ewts-keyboard__row">
              {row.map((key) => (
                <button
                  type="button"
                  key={key.wylie}
                  className="ewts-keyboard__key"
                  title={'label' in key ? key.label : key.wylie}
                  onClick={() => {
                    if (editor && key.tibetan.length === 1) {
                      editor.chain().focus().insertContent(key.tibetan).run()
                    }
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
        </div>
      )}
    </div>
  )
}
