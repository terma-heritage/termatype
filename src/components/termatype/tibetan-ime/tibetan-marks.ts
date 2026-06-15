// Tibetan special marks for the editor's insert palette.
//
// WHY THIS FILE EXISTS
// --------------------
// The EWTS / Wylie standard does NOT define keystrokes for many Tibetan marks:
// honorific head marks, terma (gter / brda-rnying) head ornaments, auspicious
// symbols. No Wylie keyboard — however proven — can type them, because the
// transliteration scheme has no code for them. They must be inserted from a
// palette like this one.
//
// The `wylie` field documents the gap precisely:
//   - a string  → the EWTS keystroke that produces the mark (also typeable);
//   - null      → palette-only; there is NO way to type it via Wylie.
//
// PORTING TO OTHER PROJECTS
// -------------------------
// Tibetan input needs TWO independent pieces. Both must be ported:
//   1. The EWTS converter (`tibetan-ewts-converter`, see ewts.ts) — covers the
//      alphabet, stacks, vowels, and the common punctuation/head marks that DO
//      have a `wylie` value below.
//   2. This palette — covers every `wylie: null` mark. Wire each mark's `char`
//      into the host app's "insert character" action. The data here is
//      framework-agnostic; only the rendering/insert call is app-specific.
// Codepoints are included so the list can be reproduced exactly elsewhere.

export interface TibetanMark {
  /** The character to insert. */
  char: string
  /** Short tooltip label. */
  label: string
  /** Unicode codepoint, e.g. 'U+0F38'. */
  codepoint: string
  /** EWTS keystroke that produces it, or null if it is palette-only. */
  wylie: string | null
}

export interface TibetanMarkGroup {
  category: string
  marks: TibetanMark[]
}

export const TIBETAN_MARK_GROUPS: TibetanMarkGroup[] = [
  {
    category: 'Head marks (yig mgo)',
    marks: [
      { char: '༄', label: 'Yig mgo mdun ma (initial)', codepoint: 'U+0F04', wylie: '@' },
      { char: '༅', label: 'Yig mgo sgab ma (closing)', codepoint: 'U+0F05', wylie: '#' },
      { char: '༆', label: 'Yig mgo phur shad ma', codepoint: 'U+0F06', wylie: '$' },
      { char: '༇', label: 'Yig mgo tsheg shad ma', codepoint: 'U+0F07', wylie: '%' },
      { char: '༈', label: 'Sbrul shad', codepoint: 'U+0F08', wylie: '!' },
    ],
  },
  {
    category: 'Honorific marks',
    marks: [
      // Che mgo: the honorific prefixed to revered titles, e.g. His Holiness
      // the Dalai Lama — ༸གོང་ས་མཆོག. Used constantly; not typeable in Wylie.
      { char: '༸', label: 'Che mgo — honorific head (༸གོང་ས་མཆོག)', codepoint: 'U+0F38', wylie: null },
      { char: '༵', label: 'Ngas bzung nyi zla', codepoint: 'U+0F35', wylie: null },
      { char: '༶', label: 'Caret -dzud rtags bzhi mig can', codepoint: 'U+0F36', wylie: null },
      { char: '༷', label: 'Ngas bzung sgor rtags', codepoint: 'U+0F37', wylie: null },
      { char: '༹', label: 'Tsa -phru', codepoint: 'U+0F39', wylie: null },
    ],
  },
  {
    category: 'Terma / old-orthography marks',
    marks: [
      { char: '༁', label: 'Gter yig mgo truncated a', codepoint: 'U+0F01', wylie: null },
      { char: '༂', label: 'Gter yig mgo -um rnam bcad ma', codepoint: 'U+0F02', wylie: null },
      { char: '༃', label: 'Gter yig mgo -um gter tsheg ma', codepoint: 'U+0F03', wylie: null },
      { char: '࿓', label: 'Brda rnying yig mgo mdun ma', codepoint: 'U+0FD3', wylie: null },
      { char: '࿔', label: 'Brda rnying yig mgo sgab ma', codepoint: 'U+0FD4', wylie: null },
      { char: '࿐', label: 'Bska- shog gi mgo rgyan', codepoint: 'U+0FD0', wylie: null },
      { char: '࿑', label: 'Mnyam yig gi mgo rgyan', codepoint: 'U+0FD1', wylie: null },
      { char: '࿒', label: 'Nyis tsheg', codepoint: 'U+0FD2', wylie: null },
    ],
  },
  {
    category: 'Auspicious symbols',
    marks: [
      // 'oM' yields the decomposed ཨོཾ; this is the precomposed single glyph.
      { char: 'ༀ', label: 'Om (precomposed)', codepoint: 'U+0F00', wylie: null },
      { char: '࿇', label: 'Rdo rje rgya gram (crossed vajra)', codepoint: 'U+0FC7', wylie: null },
      { char: '࿄', label: 'Dril bu (bell)', codepoint: 'U+0FC4', wylie: null },
      { char: '࿅', label: 'Rdo rje (vajra)', codepoint: 'U+0FC5', wylie: null },
      { char: '࿕', label: 'Svasti — g.yung drung (right)', codepoint: 'U+0FD5', wylie: null },
      { char: '࿖', label: 'Svasti — g.yung drung (left)', codepoint: 'U+0FD6', wylie: null },
    ],
  },
  {
    category: 'Punctuation & braces',
    marks: [
      { char: '༔', label: 'Gter tsheg', codepoint: 'U+0F14', wylie: ':' },
      { char: '༑', label: 'Rin chen spungs shad', codepoint: 'U+0F11', wylie: '|' },
      { char: '༒', label: 'Nyis tsheg', codepoint: 'U+0F12', wylie: null },
      { char: '༗', label: 'Ku ru kha', codepoint: 'U+0F17', wylie: null },
      { char: '༼', label: 'Left brace', codepoint: 'U+0F3C', wylie: '(' },
      { char: '༽', label: 'Right brace', codepoint: 'U+0F3D', wylie: ')' },
    ],
  },
]
