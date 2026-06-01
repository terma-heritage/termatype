const SHORTCUTS = [
  { category: 'File', items: [
    { keys: 'Ctrl+N', desc: 'New document' },
    { keys: 'Ctrl+O', desc: 'Open file' },
    { keys: 'Ctrl+S', desc: 'Save' },
    { keys: 'Ctrl+Shift+S', desc: 'Save As' },
    { keys: 'Ctrl+P', desc: 'Print' },
  ]},
  { category: 'Edit', items: [
    { keys: 'Ctrl+Z', desc: 'Undo' },
    { keys: 'Ctrl+Shift+Z', desc: 'Redo' },
    { keys: 'Ctrl+F', desc: 'Find & Replace' },
    { keys: 'Ctrl+A', desc: 'Select All' },
  ]},
  { category: 'Format', items: [
    { keys: 'Ctrl+B', desc: 'Bold' },
    { keys: 'Ctrl+I', desc: 'Italic' },
    { keys: 'Ctrl+U', desc: 'Underline' },
    { keys: 'Ctrl+Shift+X', desc: 'Strikethrough' },
    { keys: 'Ctrl+K', desc: 'Insert link' },
    { keys: 'Ctrl+Alt+1-3', desc: 'Heading 1-3' },
    { keys: 'Tab', desc: 'Indent' },
    { keys: 'Shift+Tab', desc: 'Outdent' },
  ]},
  { category: 'Alignment', items: [
    { keys: 'Ctrl+L', desc: 'Align left' },
    { keys: 'Ctrl+E', desc: 'Align center' },
    { keys: 'Ctrl+R', desc: 'Align right' },
    { keys: 'Ctrl+J', desc: 'Justify' },
  ]},
  { category: 'View', items: [
    { keys: 'Ctrl++/-', desc: 'Zoom in/out' },
    { keys: 'Ctrl+0', desc: 'Reset zoom' },
    { keys: 'Ctrl+\\', desc: 'Focus mode' },
    { keys: 'Ctrl+/', desc: 'Keyboard shortcuts' },
  ]},
  { category: 'Language', items: [
    { keys: 'Ctrl+Space', desc: 'Toggle Tibetan/English' },
  ]},
]

const SHORTCUTS_BO = [
  { category: 'ཡིག་ཆ།', items: [
    { keys: 'Ctrl+N', desc: 'ཡིག་ཆ་གསར་བཟོ།' },
    { keys: 'Ctrl+O', desc: 'ཡིག་ཆ་ཁ་ཕྱེ།' },
    { keys: 'Ctrl+S', desc: 'ཉར་ཚགས།' },
    { keys: 'Ctrl+Shift+S', desc: 'གཞན་ཉར།' },
    { keys: 'Ctrl+P', desc: 'པར་འདེབས།' },
  ]},
  { category: 'རྩོམ་སྒྲིག', items: [
    { keys: 'Ctrl+Z', desc: 'ཕྱིར་འཐེན།' },
    { keys: 'Ctrl+Shift+Z', desc: 'བསྐྱར་བྱེད།' },
    { keys: 'Ctrl+F', desc: 'འཚོལ་བརྗེ།' },
    { keys: 'Ctrl+A', desc: 'ཚང་མ་འདེམས།' },
  ]},
  { category: 'རྣམ་གཞག', items: [
    { keys: 'Ctrl+B', desc: 'སྦོམ་པོ།' },
    { keys: 'Ctrl+I', desc: 'གཡོན་འཁྱོག' },
    { keys: 'Ctrl+U', desc: 'འོག་ཐིག' },
    { keys: 'Ctrl+Shift+X', desc: 'དཀྲོག་ཐིག' },
    { keys: 'Ctrl+K', desc: 'སྦྲེལ་མཐུད་བསྒར།' },
    { keys: 'Ctrl+Alt+1-3', desc: 'མགོ་བྱང་ ༡-༣' },
    { keys: 'Tab', desc: 'ནང་སྐུད།' },
    { keys: 'Shift+Tab', desc: 'ཕྱིར་སྐུད།' },
  ]},
  { category: 'ཐིག་སྒྲིག', items: [
    { keys: 'Ctrl+L', desc: 'གཡོན་སྒྲིག' },
    { keys: 'Ctrl+E', desc: 'དཀྱིལ་སྒྲིག' },
    { keys: 'Ctrl+R', desc: 'གཡས་སྒྲིག' },
    { keys: 'Ctrl+J', desc: 'མཉམ་སྒྲིག' },
  ]},
  { category: 'ལྟ་བཤེར།', items: [
    { keys: 'Ctrl++/-', desc: 'ཆེ་ཆུང་།' },
    { keys: 'Ctrl+0', desc: 'ཆེ་ཆུང་སོར་ཆུད།' },
    { keys: 'Ctrl+\\', desc: 'དམིགས་གཏད།' },
    { keys: 'Ctrl+/', desc: 'མཐེབ་གནོན།' },
  ]},
  { category: 'སྐད་ཡིག', items: [
    { keys: 'Ctrl+Space', desc: 'བོད་དབྱིན་བརྗེ།' },
  ]},
]

interface KeyboardShortcutsPageProps {
  menuLang?: 'en' | 'bo'
}

export function KeyboardShortcutsPage({ menuLang = 'en' }: KeyboardShortcutsPageProps) {
  const isBo = menuLang === 'bo'
  const shortcuts = isBo ? SHORTCUTS_BO : SHORTCUTS
  const title = isBo ? 'མཐེབ་གནོན།' : 'Keyboard Shortcuts'

  return (
    <div className={`help-page${isBo ? ' help-page-bo' : ''}`}>
      <div className="help-page-content">
        <h1>{title}</h1>
        <div className="shortcuts-grid">
          {shortcuts.map(({ category, items }) => (
            <div key={category} className="shortcuts-page-category">
              <h3>{category}</h3>
              {items.map(({ keys, desc }) => (
                <div key={keys} className="shortcuts-page-row">
                  <kbd>{keys}</kbd>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
