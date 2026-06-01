function AboutEN() {
  return (
    <>
      <h1>Welcome to TermaType</h1>
      <p className="about-page-tibetan">གཏེར་མ་ཡིག་སྦྱོར།</p>
      <p className="about-page-subtitle"><em>Beautiful bilingual writing</em></p>
      <p>
        A free, open-source writing app for English and Tibetan.
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
        <li><strong>Tibetan-English Dictionary</strong> — hover or select any word for instant definitions</li>
        <li><strong>Wylie-aware Find & Replace</strong> — search using Wylie transliteration and find the matching Tibetan text</li>
        <li><strong>Click-to-insert</strong> — search English words and insert their Tibetan equivalents directly</li>
      </ul>

      <h2>Writing Modes</h2>
      <ul>
        <li><strong>Focus Mode</strong> — hide all toolbars and menus for distraction-free writing (<code>Ctrl+\</code>)</li>
        <li><strong>Typewriter Mode</strong> — keeps the current line centered on screen as you type</li>
        <li><strong>Reading Mode</strong> — lock the document to read without accidental edits</li>
        <li><strong>Zoom</strong> — adjust the editor zoom from 50% to 200%</li>
      </ul>

      <h2>Document Management</h2>
      <ul>
        <li><strong>Tabs</strong> — work on multiple documents at once</li>
        <li><strong>Auto-save</strong> — your work is saved automatically as you type</li>
        <li><strong>DOCX format</strong> — open and save Word-compatible .docx files, plus .txt and .md</li>
      </ul>

      <h2>Print & Export</h2>
      <ul>
        <li>Print with native system dialog (<code>Ctrl+P</code>)</li>
        <li>Export as PDF with beautiful formatting</li>
        <li>Export as EPUB for e-readers</li>
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
          <tr><td>Slash commands</td><td><code>/</code></td></tr>
          <tr><td>All shortcuts</td><td><code>Ctrl+/</code></td></tr>
        </tbody>
      </table>

      <h2>Privacy</h2>
      <p>
        TermaType is 100% local. Your documents and dictionary lookups all stay on your
        computer. Nothing is sent to the cloud. No accounts, no tracking, no telemetry.
      </p>
    </>
  )
}

function AboutBO() {
  return (
    <>
      <h1>གཏེར་མ་ཡིག་སྦྱོར་ལ་བསུ་བ་ཞུ།</h1>
      <p className="about-page-tibetan">TermaType</p>
      <p className="about-page-subtitle"><em>སྐད་གཉིས་ཀྱི་ཡིག་སྦྱོར་མཛེས་པོ།</em></p>
      <p>
        དབྱིན་ཡིག་དང་བོད་ཡིག་གཉིས་ཀའི་ཆེད་དུ་བཟོས་པའི་རིན་མེད་ཡིག་སྦྱོར་མཉེན་ཆས།
        ཁྱོད་ཀྱི་གློག་ཀླད་ཐོག་ཡོངས་སུ་འཁོར། དྲ་རྒྱ་མི་དགོས། ཁྱོད་ཀྱི་ཡིག་ཆ་གཞན་སར་མི་གཏོང་།
      </p>

      <hr />

      <h2>བོད་ཡིག་འཇུག་ཐབས།</h2>
      <p>
        <code>Ctrl+Space</code> མནན་ནས་དབྱིན་ཡིག་དང་བོད་ཡིག་བརྗེ། གཏེར་མ་ཡིག་སྦྱོར་གྱིས་
        <strong>ཝ་ལིའི་སྒྱུར་བྱང་</strong> བཀོལ་སྤྱོད་བྱས་ནས་དབྱིན་ཡིག་གི་ཡི་གེ་བརྡ་ཆོས་ནས་བོད་ཡིག་ཏུ་རང་བཞིན་གྱིས་སྒྱུར།
        དཔེར་ན་ <code>bkra shis bde legs</code> བྲིས་ན་ བཀྲ་ཤིས་བདེ་ལེགས། ཐོན།
      </p>
      <p>
        བོད་ཡིག་འབྲི་སྐབས་མཐེབ་གཞོང་གི་ལམ་སྟོན་མཐོང་ཐུབ།{' '}
        <strong>རོགས་རམ། → ཝ་ལིའི་གཞུང་།</strong> ནས་མཐེབ་གཞོང་གི་རྣམ་པ་ཚང་མ་ལྟ་ཐུབ།{' '}
        <strong>རོགས་རམ། → བོད་ཡིག་སྦྱོང་བརྡར།</strong> ནས་སྦྱོང་བརྡར་བྱེད་ཐུབ།
      </p>

      <h2>རྣམ་གཞག་ཕུན་སུམ་ཚོགས་པ།</h2>
      <ul>
        <li>མགོ་བྱང་། སྦོམ་པོ། གཡོན་འཁྱོག བཅས་ཀྱི་རྣམ་གཞག</li>
        <li>རེའུ་མིག། པར་རིས། དྲངས་ཚིག བཅས།</li>
        <li>ཡིག་གཟུགས། ཡིག་ཚད། ཚོས་གཞི། ཐིག་ཕྲེང་བར་ཐག བཅས་བཟོ་བཅོས།</li>
        <li>ཞབས་མཆན་དང་ཤོག་ངོས་གསར་བརྗེ།</li>
        <li><code>/</code> བྲིས་ན་དེ་མ་ཐག་མགོ་བྱང་། རེའུ་མིག སོགས་བསྒར་ཐུབ།</li>
      </ul>

      <h2>བོད་ཡིག་ལག་ཆ།</h2>
      <ul>
        <li><strong>བོད་དབྱིན་ཚིག་མཛོད།</strong> — ཚིག་གང་ཡང་རེག་ཙམ་བྱས་ན་འགྲེལ་བཤད་མཐོང་ཐུབ།</li>
        <li><strong>ཝ་ལིའི་འཚོལ་བརྗེ།</strong> — ཝ་ལིའི་ཡིག་སྒྱུར་བཀོལ་ནས་བོད་ཡིག་འཚོལ་ཐུབ།</li>
        <li><strong>མནན་ནས་བསྒར།</strong> — དབྱིན་ཡིག་འཚོལ་ནས་བོད་ཡིག་ཐད་ཀར་བསྒར་ཐུབ།</li>
      </ul>

      <h2>འབྲི་ཐབས་སྣ་ཚོགས།</h2>
      <ul>
        <li><strong>དམིགས་གཏད་ཐབས།</strong> — ལག་ཆ་ཚང་མ་སྦས་ནས་སེམས་གཏད་ཀྱིས་འབྲི། (<code>Ctrl+\</code>)</li>
        <li><strong>ཡིག་འཕྲུལ་ཐབས།</strong> — འབྲི་བཞིན་པའི་ཕྲེང་དེ་ཡར་སྟོང་ངོས་ཀྱི་དཀྱིལ་དུ་བཞག</li>
        <li><strong>ཀློག་ཐབས།</strong> — ཡིག་ཆ་ཀློག་ཙམ་བྱས་ནས་ནོར་སྐྱོན་མི་འབྱུང་བ།</li>
        <li><strong>ཆེ་ཆུང་།</strong> — ༥༠% ནས་ ༢༠༠% བར་བཟོ་བཅོས།</li>
      </ul>

      <h2>ཡིག་ཆ་དོ་དམ།</h2>
      <ul>
        <li><strong>ཤོག་བྱང་།</strong> — ཡིག་ཆ་མང་པོ་མཉམ་དུ་ཁ་ཕྱེ་ཐུབ།</li>
        <li><strong>རང་ཉར།</strong> — འབྲི་བཞིན་པ་རང་བཞིན་གྱིས་ཉར།</li>
        <li><strong>DOCX རྣམ་གཞག</strong> — Word ཡིག་ཆ་ཁ་ཕྱེ་བ་དང་ཉར་ཐུབ།</li>
      </ul>

      <h2>པར་འདེབས་དང་ཕྱིར་འདོན།</h2>
      <ul>
        <li>པར་འདེབས། (<code>Ctrl+P</code>)</li>
        <li>PDF ཕྱིར་འདོན།</li>
        <li>EPUB ཕྱིར་འདོན།</li>
      </ul>

      <h2>མཐེབ་གནོན།</h2>
      <table className="about-page-table">
        <thead>
          <tr><th>བྱ་བ།</th><th>མཐེབ་གནོན།</th></tr>
        </thead>
        <tbody>
          <tr><td>སྐད་ཡིག་བརྗེ་བ།</td><td><code>Ctrl+Space</code></td></tr>
          <tr><td>དམིགས་གཏད་ཐབས།</td><td><code>Ctrl+\</code></td></tr>
          <tr><td>འཚོལ་བརྗེ།</td><td><code>Ctrl+H</code></td></tr>
          <tr><td>བརྡ་བཀོད།</td><td><code>/</code></td></tr>
          <tr><td>མཐེབ་གནོན་ཚང་མ།</td><td><code>Ctrl+/</code></td></tr>
        </tbody>
      </table>

      <h2>གསང་བ་སྲུང་སྐྱོབ།</h2>
      <p>
        གཏེར་མ་ཡིག་སྦྱོར་ཁྱོད་ཀྱི་གློག་ཀླད་ཐོག་ཡོངས་སུ་འཁོར།
        ཁྱོད་ཀྱི་ཡིག་ཆ་དང་ཚིག་མཛོད་འཚོལ་ཞིབ་ཚང་མ་ཁྱོད་ཀྱི་གློག་ཀླད་ནང་བཞག
        སྤྲིན་གྱི་ཞབས་ཞུ་མི་སྤྱོད། ཐོ་འགོད་མི་དགོས། རྗེས་འདེད་མི་བྱེད། གནས་ཚུལ་མི་བསྡུ།
      </p>
    </>
  )
}

export function AboutPage({ menuLang = 'en' }: { menuLang?: 'en' | 'bo' }) {
  const bo = menuLang === 'bo'

  return (
    <div className={`about-page${bo ? ' about-page-bo' : ''}`}>
      <div className="about-page-inner">
        {bo ? <AboutBO /> : <AboutEN />}

        <hr />

        <div className="about-page-credits">
          <p className="about-page-dedication">
            {bo ? (
              <em>འགྲོ་བ་ཀུན་ལ་ཕན་ཕྱིར་མཉེན་ཆས་འདི་རིན་མེད་དུ་ཕུལ།<br />
              བོད་ཀྱི་སྐད་ཡིག་རུས་རྒྱུན་མི་ཉམས་པར་རྒྱུན་འཛིན་ཐུབ་པའི་རེ་སྨོན་ཞུ།</em>
            ) : (
              <em>This software is offered freely for the benefit of all beings.<br />
              May it help preserve and share the Tibetan language for generations to come.</em>
            )}
          </p>
          <p>
            {bo ? (
              <>
                <strong>གཏེར་མ་ཤུལ་བཞག་རིག་གཞུང་མཐུན་ཚོགས།</strong> ཀྱིས་བཟོས།<br />
                འགན་འཛིན་གཙོ་བོ། <strong>ལྕགས་རི་ཤར་ཐུབ་བསྟན་ཉི་མ།</strong>
              </>
            ) : (
              <>
                Built by <strong>Terma Heritage Foundation, Inc.</strong><br />
                Lead developer: <strong>Thupten Chakrishar</strong>
              </>
            )}
          </p>
          <p className="about-page-mission">
            {bo ? (
              <em>
                ཧི་མ་ལ་ཡ་དང་བོད་ཀྱི་རིག་གཞུང་ཤུལ་བཞག་སྲུང་སྐྱོབ་དང་འཕེལ་རྒྱས་གཏོང་བ།
                ལྷག་པར་སྐད་ཡིག་སྲུང་སྐྱོབ་དང་གསོ་སྐྱོང་བྱེད་པ།
                རིག་གནས་དང་སློབ་གསོ། སྒྱུ་རྩལ། སྤྱི་ཚོགས་ལས་འཆར་བརྒྱུད་
                བོད་དང་ཧི་མ་ལ་ཡ་མི་རིགས་དང་འཛམ་གླིང་ཡོངས་ཀྱི་སྤྱི་ཚོགས་ལ་ཕན་ཐོགས་སུ།
              </em>
            ) : (
              <em>
                To preserve, promote, and advance Himalayan and Tibetan cultural heritage, including
                language preservation and revitalization, through technology, education, arts, and
                community programs — for the benefit of Tibetan, Himalayan, and broader communities
                worldwide.
              </em>
            )}
          </p>
          <p>
            {bo ? (
              <>
                ང་ཚོའི་དྲ་ཚིགས་{' '}
                <a href="https://termafoundation.org/" target="_blank" rel="noopener noreferrer">
                  termafoundation.org
                </a>{' '}
                ལ་གཟིགས་རོགས།
              </>
            ) : (
              <>
                Visit us at{' '}
                <a href="https://termafoundation.org/" target="_blank" rel="noopener noreferrer">
                  termafoundation.org
                </a>{' '}
                for more tools and resources.
              </>
            )}
          </p>
          <p className="about-page-version">TermaType v2.0.0</p>
        </div>
      </div>
    </div>
  )
}
