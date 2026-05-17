export function WylieReference() {
  return (
    <div className="wylie-reference">
      <div className="wylie-ref-header">
        <h3>EWTS Reference</h3>
      </div>
      <div className="wylie-ref-body">

        <section className="wylie-ref-section">
          <h4>How It Works</h4>
          <p>Type Wylie transliteration and TermaType converts it to Tibetan Unicode in real time. Press <kbd>Ctrl+Space</kbd> to switch between English and Tibetan.</p>
        </section>

        <section className="wylie-ref-section">
          <h4>Consonants</h4>
          <div className="wylie-ref-grid">
            <span>k ཀ</span><span>kh ཁ</span><span>g ག</span><span>ng ང</span>
            <span>c ཅ</span><span>ch ཆ</span><span>j ཇ</span><span>ny ཉ</span>
            <span>t ཏ</span><span>th ཐ</span><span>d ད</span><span>n ན</span>
            <span>p པ</span><span>ph ཕ</span><span>b བ</span><span>m མ</span>
            <span>ts ཙ</span><span>tsh ཚ</span><span>dz ཛ</span><span>w ཝ</span>
            <span>zh ཞ</span><span>z ཟ</span><span>' འ</span><span>y ཡ</span>
            <span>r ར</span><span>l ལ</span><span>sh ཤ</span><span>s ས</span>
            <span>h ཧ</span><span>a ཨ</span>
          </div>
        </section>

        <section className="wylie-ref-section">
          <h4>Vowels</h4>
          <div className="wylie-ref-grid cols-3">
            <span>a (inherent)</span><span>i ི</span><span>u ུ</span>
            <span>e ེ</span><span>o ོ</span><span>A ཱ</span>
            <span>ai ཻ</span><span>au ཽ</span><span>-i ྀ</span>
          </div>
        </section>

        <section className="wylie-ref-section">
          <h4>Spacing &amp; Punctuation</h4>
          <table className="wylie-ref-table">
            <tbody>
              <tr><td><kbd>Space</kbd></td><td>Tsheg ་ (syllable separator)</td></tr>
              <tr><td><kbd>Space Space</kbd></td><td>Real space (after tsheg)</td></tr>
              <tr><td><kbd>/</kbd></td><td>Shad །</td></tr>
              <tr><td><kbd>//</kbd></td><td>Double shad ༎</td></tr>
              <tr><td><kbd>,</kbd></td><td>Tsheg ་</td></tr>
              <tr><td><kbd>.</kbd></td><td>Syllable break (prevents stacking)</td></tr>
              <tr><td><kbd>*</kbd></td><td>Non-breaking tsheg ༌</td></tr>
            </tbody>
          </table>
        </section>

        <section className="wylie-ref-section">
          <h4>More Punctuation</h4>
          <div className="wylie-ref-grid cols-3">
            <span>; ༏</span><span>| ༑</span><span>! ༈</span>
            <span>: ༔</span><span>@ ༄༅</span><span># ༅</span>
            <span>{'<'} ༺</span><span>{'>'} ༻</span><span>( ༼</span>
            <span>) ༽</span><span>= ༴</span><span>? ྄</span>
          </div>
        </section>

        <section className="wylie-ref-section">
          <h4>Stacking</h4>
          <p>Consonant clusters stack automatically when valid. Type the consonants in sequence:</p>
          <div className="wylie-ref-examples">
            <div><code>bkra</code> → བཀྲ</div>
            <div><code>rgya</code> → རྒྱ</div>
            <div><code>bsgrubs</code> → བསྒྲུབས</div>
          </div>
          <p>Use <kbd>.</kbd> between consonants to prevent stacking:</p>
          <div className="wylie-ref-examples">
            <div><code>g.ya</code> → གཡ (not གྱ)</div>
          </div>
          <p>Use <kbd>+</kbd> to force non-standard (Sanskrit) stacking:</p>
          <div className="wylie-ref-examples">
            <div><code>k+Sha</code> → ཀྵ</div>
          </div>
        </section>

        <section className="wylie-ref-section">
          <h4>Sanskrit Extensions</h4>
          <div className="wylie-ref-grid cols-3">
            <span>T ཊ</span><span>Th ཋ</span><span>D ཌ</span>
            <span>N ཎ</span><span>Sh ཥ</span>
          </div>
          <h4 style={{ marginTop: '0.75rem' }}>Sanskrit Marks</h4>
          <div className="wylie-ref-grid cols-3">
            <span>M ཾ (bindu)</span><span>H ཿ (visarga)</span><span>~M ྃ (anusvara)</span>
          </div>
        </section>

        <section className="wylie-ref-section">
          <h4>Digits</h4>
          <div className="wylie-ref-grid cols-5">
            <span>0 ༠</span><span>1 ༡</span><span>2 ༢</span><span>3 ༣</span><span>4 ༤</span>
            <span>5 ༥</span><span>6 ༦</span><span>7 ༧</span><span>8 ༨</span><span>9 ༩</span>
          </div>
        </section>

        <section className="wylie-ref-section wylie-ref-footer">
          <p>Based on the <a href="https://texts.mandala.library.virginia.edu/text/thl-extended-wylie-transliteration-scheme" target="_blank" rel="noopener noreferrer">THL Extended Wylie Transliteration Scheme</a></p>
        </section>
      </div>
    </div>
  )
}
