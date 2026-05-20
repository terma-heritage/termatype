export function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-page-inner">
        <h1>Welcome to TermaType</h1>
        <p className="about-page-tibetan">གཏེར་མ་ཡིག་སྦྱོར།</p>
        <p className="about-page-subtitle"><em>Beautiful bilingual writing</em></p>
        <p>
          A free, open-source writing app for English and Tibetan (བོད་ཡིག).
          Everything runs locally on your computer — your writing never leaves your device.
        </p>

        <hr />

        <h2>Tibetan Input</h2>
        <p>
          Press <code>Ctrl+Space</code> to switch between English and Tibetan. TermaType uses{' '}
          <strong>Wylie transliteration</strong> — type roman letters and they convert to Tibetan
          script automatically. For example, type <code>bkra shis bde legs</code> to get
          བཀྲ་ཤིས་བདེ་ལེགས། (Tashi Delek).
        </p>
        <p>
          A visual keyboard guide appears while typing in Tibetan mode. Open{' '}
          <strong>Help → Wylie Reference</strong> for the full key mapping, or{' '}
          <strong>Help → Typing Tibetan</strong> for an interactive practice page.
        </p>

        <h2>Rich Formatting</h2>
        <ul>
          <li>Headings, bold, italic, underline, strikethrough, highlight, superscript, subscript</li>
          <li>Bullet lists, numbered lists, and task lists with checkboxes</li>
          <li>Resizable tables, images, blockquotes, and syntax-highlighted code blocks</li>
          <li>Font family, font size, text color, text alignment, line height, and indentation</li>
          <li>Footnotes and page breaks for print-ready documents (Insert menu)</li>
          <li><strong>Slash commands</strong> — type <code>/</code> anywhere to quickly insert headings, lists, tables, images, and more</li>
          <li><strong>Format Painter</strong> — copy formatting from one selection and apply it to another (toolbar button)</li>
        </ul>

        <h2>Tibetan Language Tools</h2>
        <ul>
          <li><strong>Tibetan Dictionary</strong> — look up words instantly from Rangjung Yeshe and Monlam dictionaries (View → Dictionary, or <code>Ctrl+D</code>)</li>
          <li><strong>Inline Dictionary</strong> — select any Tibetan word and right-click to look it up instantly in a popup</li>
          <li><strong>Tibetan Spellcheck</strong> — unrecognized Tibetan words are underlined in red, powered by the dictionary database</li>
          <li><strong>Wylie-aware Find & Replace</strong> — search using Wylie transliteration and find the matching Tibetan text (<code>Ctrl+H</code>, toggle the "Wy" button)</li>
          <li><strong>Translation</strong> — translate between Tibetan and English using the MITRA model offline, or via dharmamitra.org (View → Translator)</li>
        </ul>

        <h2>AI Writing Assistant</h2>
        <p>
          An optional local AI assistant that runs entirely on your computer. Select text and ask it
          to fix grammar, rewrite, expand, summarize, or translate. Install via{' '}
          <strong>View → Extensions</strong> and open with <strong>View → Assistant</strong>.
        </p>

        <h2>Writing Modes</h2>
        <ul>
          <li><strong>Focus Mode</strong> — hide all toolbars and menus for distraction-free writing (<code>Ctrl+\</code>)</li>
          <li><strong>Typewriter Mode</strong> — keeps the current line centered on screen as you type (View → Typewriter Mode)</li>
          <li><strong>Reading Mode</strong> — lock the document to read without accidental edits (View → Reading Mode)</li>
          <li><strong>Zoom</strong> — adjust the editor zoom from 50% to 200% (View → Zoom In/Out)</li>
        </ul>

        <h2>Document Management</h2>
        <ul>
          <li><strong>Tabs</strong> — work on multiple documents at once with browser-style tabs</li>
          <li><strong>Auto-save</strong> — your work is saved automatically as you type</li>
          <li><strong>Auto-naming</strong> — unsaved documents are automatically named from their first heading or paragraph</li>
          <li><strong>Version History</strong> — browse and restore previous versions of your document (File → Version History)</li>
          <li><strong>DOCX format</strong> — open and save Word-compatible .docx files, plus .txt and .md</li>
        </ul>

        <h2>Print & Export</h2>
        <ul>
          <li>Print with native system dialog (<code>Ctrl+P</code>)</li>
          <li>Export as PDF with beautiful formatting</li>
          <li>Export as EPUB for e-readers</li>
        </ul>

        <h2>Side Panel Tools</h2>
        <p>Open the side panel from the View menu to access:</p>
        <ul>
          <li><strong>Dictionary</strong> — Tibetan-English dictionary lookup</li>
          <li><strong>Assistant</strong> — AI writing assistant (local, optional plugin)</li>
          <li><strong>Translator</strong> — Tibetan↔English translation</li>
          <li><strong>Document Outline</strong> — navigate your document by headings</li>
        </ul>

        <h2>Keyboard Shortcuts</h2>
        <table className="about-page-table">
          <thead>
            <tr><th>Action</th><th>Shortcut</th></tr>
          </thead>
          <tbody>
            <tr><td>Switch language</td><td><code>Ctrl+Space</code></td></tr>
            <tr><td>Focus mode</td><td><code>Ctrl+\</code></td></tr>
            <tr><td>Find & replace</td><td><code>Ctrl+H</code></td></tr>
            <tr><td>Dictionary lookup</td><td><code>Ctrl+D</code></td></tr>
            <tr><td>Insert page break</td><td><code>Ctrl+Enter</code></td></tr>
            <tr><td>Slash commands</td><td><code>/</code></td></tr>
            <tr><td>All shortcuts</td><td><code>Ctrl+/</code></td></tr>
          </tbody>
        </table>

        <h2>Privacy</h2>
        <p>
          TermaType is 100% local. Your documents, dictionary lookups, spellcheck, AI assistant,
          and translations all run on your computer. Nothing is sent to the cloud. No accounts,
          no tracking, no telemetry.
        </p>

        <hr />

        <div className="about-page-credits">
          <p>
            Built by <strong>Thupten Chakrishar</strong> at <strong>Terma Heritage Foundation, Inc.</strong>
          </p>
          <p className="about-page-mission">
            <em>
              To preserve, promote, and advance Himalayan and Tibetan cultural heritage, including
              language preservation and revitalization, through technology, education, arts, and
              community programs — for the benefit of Tibetan, Himalayan, and broader communities
              worldwide.
            </em>
          </p>
          <p>
            Visit us at{' '}
            <a href="https://termafoundation.org/" target="_blank" rel="noopener noreferrer">
              termafoundation.org
            </a>{' '}
            for more tools and resources.
          </p>
          <p className="about-page-version">Version 0.1.0</p>
        </div>
      </div>
    </div>
  )
}
