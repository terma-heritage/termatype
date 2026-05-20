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

export function KeyboardShortcutsPage() {
  return (
    <div className="help-page">
      <div className="help-page-content">
        <h1>Keyboard Shortcuts</h1>
        <div className="shortcuts-grid">
          {SHORTCUTS.map(({ category, items }) => (
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
