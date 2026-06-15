interface HelpPageProps {
  menuLang?: 'en' | 'bo'
  onPractice: () => void
  onWylieReference: () => void
  onTcrcReference: () => void
  onShortcuts: () => void
}

export function HelpPage({
  menuLang = 'en',
  onPractice,
  onWylieReference,
  onTcrcReference,
  onShortcuts,
}: HelpPageProps) {
  const bo = menuLang === 'bo'

  const faqs = bo
    ? [
        {
          q: 'བོད་ཡིག་ཇི་ལྟར་འབྲི།',
          a: <>རྩོམ་སྒྲིག་ནང་ <kbd>Ctrl+Space</kbd> མནན་ནམ་ཤོག་ངོས་སྟེང་གི་རྟགས་ལ་ནོན་ནས་བོད་ཡིག་ཐབས་སུ་སྒྱུར། དེ་ནས་འབྲི། ཝ་ལི་འམ་ TCRC སྒྲིག་འགོད་ ⚙ ནས་འདེམས།</>,
        },
        {
          q: 'ང་བོད་ཡིག་གམ་དབྱིན་ཡིག་གང་འབྲི་བཞིན་པ་ཇི་ལྟར་ཤེས།',
          a: <>འོད་རྟགས་ནི་བོད་ཡིག་ལ་དམར་སྐྱ་དང་དབྱིན་ཡིག་ལ་སྔོན་པོ་འགྱུར། ཤོག་ངོས་སྟེང་གི་རྟགས་ཀྱིས་ཀྱང་སྟོན།</>,
        },
        {
          q: 'ཝ་ལི་དང་ TCRC གཉིས་ཀྱི་ཁྱད་པར།',
          a: <>ཝ་ལིས་དབྱིན་ཡིག་སྒྲ་ཡིས་བོད་ཡིག་འབྲི (bskyod → བསྐྱོད)། TCRC ནི་བོད་ཀྱི་མཐེབ་གཞོང་སྲོལ་རྒྱུན (CTA)། སྒྲིག་འགོད་ ⚙ ནས་འདེམས།</>,
        },
        {
          q: 'ཡིག་རྟགས་དམིགས་བསལ (མགོ་རྒྱན་སོགས) ཇི་ལྟར་བསྒར།',
          a: <>བསྒར་འཛུད ▸ ཡིག་རྟགས་ནས་ ༸ སོགས་མཐེབ་གཞོང་གིས་མི་ཐུབ་པའི་ཡིག་རྟགས་འདེམས།</>,
        },
        {
          q: 'ངའི་ཡིག་ཆ་གང་དུ་ཉར།',
          a: <>ཐམས་ཅད་ཁྱེད་རང་གི་སྒྲིག་ཆས་སུ་ཉར། དྲ་རྒྱ་མི་དགོས། DOCX སུ་ཉར་ནས་ PDF/EPUB སུ་ཕྱིར་འདོན་ཆོག</>,
        },
      ]
    : [
        {
          q: 'How do I type Tibetan?',
          a: <>Press <kbd>Ctrl+Space</kbd> (or tap the language chip on the page) to switch to Tibetan, then type. Choose Wylie or TCRC in Settings ⚙.</>,
        },
        {
          q: 'How do I know if I’m typing Tibetan or English?',
          a: <>The cursor turns <strong>terracotta</strong> for Tibetan and <strong>blue</strong> for English, and the chip at the top-right of the page shows the current mode. Tap it or press <kbd>Ctrl+Space</kbd> to switch.</>,
        },
        {
          q: 'What’s the difference between Wylie and TCRC?',
          a: <><strong>Wylie</strong> types Tibetan phonetically with roman letters (bskyod → བསྐྱོད) — popular with scholars. <strong>TCRC</strong> is the standard Tibetan keyboard layout used by the CTA and the exile community. Pick yours in Settings ⚙.</>,
        },
        {
          q: 'How do I insert special characters (honorific or terma marks)?',
          a: <>Use <strong>Insert ▸ Special Characters</strong> — it has the honorific (༸), terma, and auspicious marks that the keyboards can’t type directly.</>,
        },
        {
          q: 'Where do my files go — is my data private?',
          a: <>Everything stays <strong>100% offline</strong> on your device. Save as DOCX, and export to PDF or EPUB.</>,
        },
      ]

  return (
    <div className={`help-page${bo ? ' help-page-bo' : ''}`}>
      <div className="help-page-content">
        <h1>{bo ? 'རོགས་རམ་དང་དྲི་བ།' : 'Help & FAQ'}</h1>

        {faqs.map((f, i) => (
          <section className="wylie-ref-section" key={i}>
            <h4>{f.q}</h4>
            <p>{f.a}</p>
          </section>
        ))}

        <h2>{bo ? 'ཞིབ་ཕྲ།' : 'Learn more'}</h2>
        <div className="help-links">
          <button type="button" className="help-link-btn" onClick={onPractice}>
            {bo ? 'བོད་ཡིག་སྦྱོང་བརྡར།' : 'Typing practice'}
          </button>
          <button type="button" className="help-link-btn" onClick={onWylieReference}>
            {bo ? 'ཝ་ལིའི་གཞུང་།' : 'Wylie reference'}
          </button>
          <button type="button" className="help-link-btn" onClick={onTcrcReference}>
            {bo ? 'TCRC མཐེབ་གཞོང་།' : 'TCRC reference'}
          </button>
          <button type="button" className="help-link-btn" onClick={onShortcuts}>
            {bo ? 'མཐེབ་གནོན།' : 'Keyboard shortcuts'}
          </button>
        </div>
      </div>
    </div>
  )
}
