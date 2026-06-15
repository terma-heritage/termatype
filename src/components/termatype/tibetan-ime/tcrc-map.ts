// TCRC (Tibetan Computer Resource Center) "Bodyig" keyboard layout.
//
// This is a POSITIONAL keymap: each physical key maps to a fixed Tibetan glyph
// (it is NOT phonetic like Wylie — e.g. `f` is ང, not "f"). Stacks are built
// with a halant dead-key (`a` / "Link") that subjoins the next consonant, plus
// dedicated subscript keys (yatag `,`, ratag `.`) and superscript head keys
// (rago/lago/sago).
//
// Source of truth: TCRC's official "Default TCRC-Tibetan Keyboard Layout"
// chart. Entries marked `VERIFY` are best-effort reads of rarer keys from that
// chart and should be confirmed against a TCRC keyboard — fixing one is a
// single-line data edit.

export type TcrcKind =
  | 'consonant' // base consonant; becomes subjoined after a halant
  | 'vowel' // combining vowel sign
  | 'subjoined' // already a subjoined / combining form (yatag, ratag, …)
  | 'super' // head letter that subjoins the NEXT consonant (rago/lago/sago)
  | 'halant' // the "Link" dead-key: subjoins the next consonant
  | 'mark' // standalone punctuation / sign
  | 'digit'

export interface TcrcKey {
  /** Text emitted (empty for the halant dead-key). */
  out: string
  kind: TcrcKind
  /** Human label from the TCRC chart. */
  label: string
  /** True when the chart reading is uncertain and needs confirmation. */
  verify?: boolean
}

/** Base consonant U+0F40–0F6C → subjoined U+0F90–0FBC. */
export const SUBJOINED_OFFSET = 0x50

/** Map a base consonant string to its subjoined form (single codepoint). */
export function toSubjoined(base: string): string {
  const cp = base.codePointAt(0)
  if (cp === undefined) return base
  if (cp >= 0x0f40 && cp <= 0x0f6c) return String.fromCodePoint(cp + SUBJOINED_OFFSET)
  return base
}

// Keyed by the literal character produced by the physical key (shifted chars
// included). The engine looks up by the typed character.
export const TCRC_KEYMAP: Record<string, TcrcKey> = {
  // ── Consonants (base, lowercase) ───────────────────────────────────────
  k: { out: 'ཀ', kind: 'consonant', label: 'ka' },
  g: { out: 'ག', kind: 'consonant', label: 'ga' },
  f: { out: 'ང', kind: 'consonant', label: 'nga' },
  c: { out: 'ཅ', kind: 'consonant', label: 'ca' },
  j: { out: 'ཇ', kind: 'consonant', label: 'ja' },
  n: { out: 'ན', kind: 'consonant', label: 'na' },
  t: { out: 'ཏ', kind: 'consonant', label: 'ta' },
  d: { out: 'ད', kind: 'consonant', label: 'da' },
  p: { out: 'པ', kind: 'consonant', label: 'pa' },
  b: { out: 'བ', kind: 'consonant', label: 'ba' },
  m: { out: 'མ', kind: 'consonant', label: 'ma' },
  x: { out: 'ཙ', kind: 'consonant', label: 'tsa' },
  z: { out: 'ཟ', kind: 'consonant', label: 'za' },
  w: { out: 'ཝ', kind: 'consonant', label: 'wa' },
  r: { out: 'ར', kind: 'consonant', label: 'ra' },
  l: { out: 'ལ', kind: 'consonant', label: 'la' },
  s: { out: 'ས', kind: 'consonant', label: 'sa' },
  h: { out: 'ཧ', kind: 'consonant', label: 'ha' },
  y: { out: 'ཡ', kind: 'consonant', label: 'ya' },
  q: { out: 'ཊ', kind: 'consonant', label: 'Ta (retroflex)' },
  v: { out: 'ཌ', kind: 'consonant', label: 'Da (retroflex)' },

  // ── Consonants (shifted / Sanskrit) ────────────────────────────────────
  K: { out: 'ཁ', kind: 'consonant', label: 'kha' },
  T: { out: 'ཐ', kind: 'consonant', label: 'tha' },
  D: { out: 'ཛ', kind: 'consonant', label: 'dza' },
  C: { out: 'ཆ', kind: 'consonant', label: 'cha' },
  N: { out: 'ཉ', kind: 'consonant', label: 'nya' },
  P: { out: 'ཕ', kind: 'consonant', label: 'pha' },
  X: { out: 'ཚ', kind: 'consonant', label: 'tsha' },
  Z: { out: 'ཞ', kind: 'consonant', label: 'zha' },
  S: { out: 'ཤ', kind: 'consonant', label: 'sha' },
  A: { out: 'ཨ', kind: 'consonant', label: 'a (achen)' },
  Q: { out: 'ཋ', kind: 'consonant', label: 'Tha (retroflex)' },
  V: { out: 'ཎ', kind: 'consonant', label: 'Na (retroflex)' },
  M: { out: 'ཥ', kind: 'consonant', label: 'Sha (retroflex)' },
  // Sanskrit aspirates: precomposed letters (U+0F43/0F52/0F5C/0F57), matching
  // the TCRC reference implementation rather than base+subjoined-ha digraphs.
  G: { out: 'གྷ', kind: 'consonant', label: 'gha' },
  B: { out: 'བྷ', kind: 'consonant', label: 'bha' },
  F: { out: 'དྷ', kind: 'consonant', label: 'dha' },
  J: { out: 'ཛྷ', kind: 'consonant', label: 'dzha' },
  H: { out: 'ྷ', kind: 'subjoined', label: 'Link-ha (subjoined ha)' },
  W: { out: 'ྭ', kind: 'subjoined', label: 'Wasur (subjoined wa)' },

  // ── Vowels ─────────────────────────────────────────────────────────────
  i: { out: 'ི', kind: 'vowel', label: 'i' },
  u: { out: 'ུ', kind: 'vowel', label: 'u' },
  e: { out: 'ེ', kind: 'vowel', label: 'e' },
  o: { out: 'ོ', kind: 'vowel', label: 'o' },
  I: { out: 'ྀ', kind: 'vowel', label: 'reverse i (I)' },
  U: { out: 'ཱུ', kind: 'vowel', label: 'long u (U)' },
  E: { out: 'ཻ', kind: 'vowel', label: 'ai (E)' },
  O: { out: 'ཽ', kind: 'vowel', label: 'au (O)' },

  // ── Stacking helpers ───────────────────────────────────────────────────
  a: { out: '', kind: 'halant', label: 'Link (halant — subjoins next)' },
  ',': { out: 'ྱ', kind: 'subjoined', label: 'Yatag (subjoined ya)' },
  '.': { out: 'ྲ', kind: 'subjoined', label: 'Ratag (subjoined ra)' },
  '<': { out: 'ླ', kind: 'subjoined', label: 'Latag (subjoined la)' },
  R: { out: 'ར', kind: 'super', label: 'Rago (ra head)' },
  L: { out: 'ལ', kind: 'super', label: 'Lago (la head)' },
  '>': { out: 'ར', kind: 'super', label: 'Rago (ra head)' },
  '?': { out: 'ས', kind: 'super', label: 'Sago (sa head)' },

  // ── a-chung / long-a (per chart example: b k ' = བཀའ) ───────────────────
  "'": { out: 'འ', kind: 'consonant', label: 'a-chung (achung)' },
  '"': { out: 'ཱ', kind: 'vowel', label: 'aa (long a)' },

  // ── Digits ─────────────────────────────────────────────────────────────
  '1': { out: '༡', kind: 'digit', label: '1' },
  '2': { out: '༢', kind: 'digit', label: '2' },
  '3': { out: '༣', kind: 'digit', label: '3' },
  '4': { out: '༤', kind: 'digit', label: '4' },
  '5': { out: '༥', kind: 'digit', label: '5' },
  '6': { out: '༦', kind: 'digit', label: '6' },
  '7': { out: '༧', kind: 'digit', label: '7' },
  '8': { out: '༨', kind: 'digit', label: '8' },
  '9': { out: '༩', kind: 'digit', label: '9' },
  '0': { out: '༠', kind: 'digit', label: '0' },

  // ── Punctuation & marks (confirmed against the official TCRC chart) ─────
  '/': { out: '།', kind: 'mark', label: 'shad' },
  '`': { out: '༌', kind: 'mark', label: 'Tsheg-2 (non-breaking)' },
  '~': { out: '༸', kind: 'mark', label: 'Chengo (che mgo / honorific)' },
  '!': { out: '༑', kind: 'mark', label: 'Pung-shad' },
  '@': { out: '༄', kind: 'mark', label: 'Yiggo (yig mgo)' },
  '#': { out: '༄༅', kind: 'mark', label: 'Yigo full' },
  '^': { out: '྾', kind: 'mark', label: 'kur-tag' },
  '&': { out: '༼', kind: 'mark', label: 'L-brace' },
  '*': { out: '༽', kind: 'mark', label: 'R-brace' },
  '+': { out: 'ཾ', kind: 'mark', label: 'anusvara' },
  '=': { out: 'ྂ', kind: 'mark', label: 'C-bindu (candrabindu)' },
  '\\': { out: '༔', kind: 'mark', label: 'Namshad (gter tsheg)' },
  '|': { out: '༈', kind: 'mark', label: 'drul-shad' },
  ';': { out: 'ཌྷ', kind: 'consonant', label: 'Dha (retroflex DDHA)' },
}
