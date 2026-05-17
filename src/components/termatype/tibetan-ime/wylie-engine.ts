// @ts-nocheck
import {
  CONSONANTS,
  SANSKRIT_CONSONANTS,
  VOWELS,
  TIBETAN_DIGITS,
  TSHEG,
  SHAD,
  DOUBLE_SHAD,
  NON_BREAKING_TSHEG,
  PUNCTUATION,
  SANSKRIT_MARKS,
  SUPERSCRIPTS,
  SUBSCRIPTS,
  PREFIXES,
  toSubjoined,
  consonantTrie,
  trieMatch,
  longestMatch,
} from './wylie-map'

export interface EngineResult {
  committed: string
  buffer: string
  consumed: boolean
}

const ALL_CONSONANTS: Record<string, string> = { ...CONSONANTS, ...SANSKRIT_CONSONANTS }

// Tokenize a raw Wylie buffer into an array of consonant tokens
function tokenize(raw: string): { tokens: string[]; remainder: string } {
  const tokens: string[] = []
  let pos = 0
  while (pos < raw.length) {
    const { value, length } = longestMatch(consonantTrie, raw.slice(pos))
    if (value && length > 0) {
      tokens.push(value)
      pos += length
    } else {
      break
    }
  }
  return { tokens, remainder: raw.slice(pos) }
}

// Convert an array of Wylie consonant tokens into Tibetan Unicode
// applying stacking rules (superscript, root, subscript)
function renderSyllable(tokens: string[], vowel: string): string {
  if (tokens.length === 0) {
    if (vowel && vowel !== 'a') {
      return ALL_CONSONANTS['a'] + VOWELS[vowel]
    }
    return ''
  }

  if (tokens.length === 1) {
    let out = ALL_CONSONANTS[tokens[0]]
    if (vowel && vowel !== 'a') out += VOWELS[vowel]
    return out
  }

  // Try to parse the token sequence as a valid Tibetan syllable
  // Structure: [prefix] [superscript] root [subscript1] [subscript2]
  // We try various decompositions and pick the one that works

  const result = parseSyllableStructure(tokens)

  let out = ''

  if (result.prefix) {
    out += ALL_CONSONANTS[result.prefix]
  }

  if (result.superscript) {
    out += ALL_CONSONANTS[result.superscript]
    out += toSubjoined(result.root)
  } else {
    out += ALL_CONSONANTS[result.root]
  }

  for (const sub of result.subscripts) {
    out += toSubjoined(sub)
  }

  if (vowel && vowel !== 'a') {
    out += VOWELS[vowel]
  }

  for (const suf of result.suffixes) {
    out += ALL_CONSONANTS[suf]
  }

  return out
}

interface SyllableParts {
  prefix: string | null
  superscript: string | null
  root: string
  subscripts: string[]
  suffixes: string[]
}

function parseSyllableStructure(tokens: string[]): SyllableParts {
  const n = tokens.length

  // Try all valid decompositions
  // 1 token: just root
  if (n === 1) {
    return { prefix: null, superscript: null, root: tokens[0], subscripts: [], suffixes: [] }
  }

  // 2 tokens: could be prefix+root, superscript+root, root+subscript, or root+suffix
  if (n === 2) {
    const [a, b] = tokens

    // root + subscript
    if (SUBSCRIPTS[b]?.has(a)) {
      return { prefix: null, superscript: null, root: a, subscripts: [b], suffixes: [] }
    }

    // superscript + root
    if (SUPERSCRIPTS[a]?.has(b)) {
      return { prefix: null, superscript: a, root: b, subscripts: [], suffixes: [] }
    }

    // prefix + root
    if (PREFIXES[a]?.has(b)) {
      return { prefix: a, superscript: null, root: b, subscripts: [], suffixes: [] }
    }

    // fallback: first is root, rest are separate characters
    return { prefix: null, superscript: null, root: a, subscripts: [], suffixes: [b] }
  }

  // 3 tokens: many possibilities
  if (n === 3) {
    const [a, b, c] = tokens

    // prefix + root + subscript
    if (PREFIXES[a]?.has(b) && SUBSCRIPTS[c]?.has(b)) {
      return { prefix: a, superscript: null, root: b, subscripts: [c], suffixes: [] }
    }

    // superscript + root + subscript
    if (SUPERSCRIPTS[a]?.has(b) && SUBSCRIPTS[c]?.has(b)) {
      return { prefix: null, superscript: a, root: b, subscripts: [c], suffixes: [] }
    }

    // prefix + superscript + root
    if (PREFIXES[a]?.has(b) && SUPERSCRIPTS[b]) {
      // Actually prefix before superscript doesn't work this way
      // prefix + superscript + root means a is prefix, b is super, c is root
      if (SUPERSCRIPTS[b]?.has(c)) {
        return { prefix: a, superscript: b, root: c, subscripts: [], suffixes: [] }
      }
    }

    // root + subscript + subscript (e.g., root + r + w)
    if (SUBSCRIPTS[b]?.has(a) && SUBSCRIPTS[c]?.has(a)) {
      return { prefix: null, superscript: null, root: a, subscripts: [b, c], suffixes: [] }
    }

    // root + subscript + suffix
    if (SUBSCRIPTS[b]?.has(a)) {
      return { prefix: null, superscript: null, root: a, subscripts: [b], suffixes: [c] }
    }

    // superscript + root + suffix
    if (SUPERSCRIPTS[a]?.has(b)) {
      return { prefix: null, superscript: a, root: b, subscripts: [], suffixes: [c] }
    }

    // prefix + root + suffix
    if (PREFIXES[a]?.has(b)) {
      return { prefix: a, superscript: null, root: b, subscripts: [], suffixes: [c] }
    }

    // fallback
    return { prefix: null, superscript: null, root: a, subscripts: [], suffixes: [b, c] }
  }

  // 4+ tokens
  if (n >= 4) {
    const [a, b, c, d] = tokens
    const rest = tokens.slice(4)

    // prefix + superscript + root + subscript
    if (SUPERSCRIPTS[b]?.has(c) && PREFIXES[a]?.has(c) && SUBSCRIPTS[d]?.has(c)) {
      return { prefix: a, superscript: b, root: c, subscripts: [d], suffixes: rest }
    }

    // prefix + root + subscript + suffix
    if (PREFIXES[a]?.has(b) && SUBSCRIPTS[c]?.has(b)) {
      return { prefix: a, superscript: null, root: b, subscripts: [c], suffixes: [d, ...rest] }
    }

    // superscript + root + subscript + suffix
    if (SUPERSCRIPTS[a]?.has(b) && SUBSCRIPTS[c]?.has(b)) {
      return { prefix: null, superscript: a, root: b, subscripts: [c], suffixes: [d, ...rest] }
    }

    // prefix + superscript + root + suffix
    if (SUPERSCRIPTS[b]?.has(c) && PREFIXES[a]?.has(c)) {
      return { prefix: a, superscript: b, root: c, subscripts: [], suffixes: [d, ...rest] }
    }

    // fallback: treat first as root
    return { prefix: null, superscript: null, root: a, subscripts: [], suffixes: tokens.slice(1) }
  }

  return { prefix: null, superscript: null, root: tokens[0], subscripts: [], suffixes: tokens.slice(1) }
}


export class WylieEngine {
  private rawBuffer = ''
  private forceStack = false
  private lastCommitted = ''
  private pendingSlash = false
  private pendingTilde = false
  private pendingDash = false
  private pendingA = false

  feed(char: string): EngineResult {
    // Handle // (double shad) — second slash after a pending one
    if (char === '/' && this.pendingSlash) {
      this.pendingSlash = false
      const committed = DOUBLE_SHAD
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // If we had a pending slash and this char is NOT a second slash, commit shad first
    if (this.pendingSlash) {
      this.pendingSlash = false
      const shadCommit = SHAD
      this.lastCommitted = shadCommit
      const result = this.feedInner(char)
      result.committed = shadCommit + result.committed
      return result
    }

    // Handle ~M (anusvara variant)
    if (char === '~') {
      this.pendingTilde = true
      return { committed: '', buffer: this.rawBuffer + '~', consumed: true }
    }

    if (this.pendingTilde) {
      this.pendingTilde = false
      if (char === 'M') {
        const committed = this.finalizeSyllable('a') + SANSKRIT_MARKS['~M']
        this.lastCommitted = committed
        return { committed, buffer: '', consumed: true }
      }
      if (this.rawBuffer.endsWith('~')) {
        this.rawBuffer = this.rawBuffer.slice(0, -1)
      }
      return this.feedInner(char)
    }

    // Handle -i and -I (reverse vowels)
    if (char === '-') {
      this.pendingDash = true
      return { committed: '', buffer: this.rawBuffer + '-', consumed: true }
    }

    if (this.pendingDash) {
      this.pendingDash = false
      if (char === 'i' || char === 'I') {
        const vowelKey = '-' + char
        const committed = this.finalizeSyllable(vowelKey)
        if (committed) this.lastCommitted = committed
        return { committed, buffer: '', consumed: true }
      }
      if (this.rawBuffer.endsWith('-')) {
        this.rawBuffer = this.rawBuffer.slice(0, -1)
      }
      return this.feedInner(char)
    }

    // Handle ai/au composite vowels — 'a' was typed, waiting for possible i/u
    if (this.pendingA) {
      this.pendingA = false
      if (char === 'i') {
        const committed = this.finalizeSyllable('ai')
        if (committed) this.lastCommitted = committed
        return { committed, buffer: '', consumed: true }
      }
      if (char === 'u') {
        const committed = this.finalizeSyllable('au')
        if (committed) this.lastCommitted = committed
        return { committed, buffer: '', consumed: true }
      }
      // Not ai/au — finalize with 'a' first, then process this char
      const aCommit = this.finalizeSyllable('a')
      if (aCommit) this.lastCommitted = aCommit
      const result = this.feedInner(char)
      result.committed = aCommit + result.committed
      return result
    }

    return this.feedInner(char)
  }

  private feedInner(char: string): EngineResult {
    // Period in EWTS = syllable break (prevents stacking), NOT shad
    if (char === '.' && this.rawBuffer.length > 0) {
      const committed = this.flushAsSeparateChars()
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    if (char === '.' && this.rawBuffer.length === 0) {
      return { committed: '', buffer: '', consumed: true }
    }

    // Slash = shad (།), but wait for possible second slash
    if (char === '/') {
      const pre = this.finalizeSyllable('a')
      if (pre) this.lastCommitted = pre
      this.pendingSlash = true
      return { committed: pre, buffer: '', consumed: true }
    }

    // Asterisk = non-breaking tsheg
    if (char === '*') {
      const committed = this.finalizeSyllable('a') + NON_BREAKING_TSHEG
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // Space: after tsheg or shad, insert real space; otherwise finalize + tsheg
    if (char === ' ') {
      const lastChar = this.lastCommitted.slice(-1)
      if (lastChar === TSHEG || lastChar === SHAD || lastChar === DOUBLE_SHAD.slice(-1)) {
        this.lastCommitted = ' '
        return { committed: ' ', buffer: '', consumed: true }
      }
      const committed = this.finalizeSyllable('a') + TSHEG
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // Comma = tsheg
    if (char === ',') {
      const committed = this.finalizeSyllable('a') + TSHEG
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // Digits
    if (TIBETAN_DIGITS[char] !== undefined) {
      const committed = this.finalizeSyllable('a') + TIBETAN_DIGITS[char]
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // Sanskrit marks: M (bindu) and H (visarga)
    if (char === 'M') {
      const committed = this.finalizeSyllable('a') + SANSKRIT_MARKS['M']
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    if (char === 'H') {
      const committed = this.finalizeSyllable('a') + SANSKRIT_MARKS['H']
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // Punctuation (single-char lookups: ; | ! : @ # $ % < > ( ) = ? & ^)
    if (PUNCTUATION[char] !== undefined && this.rawBuffer.length === 0) {
      const committed = PUNCTUATION[char]
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // If punctuation char comes while buffer is active, finalize first
    if (PUNCTUATION[char] !== undefined && this.rawBuffer.length > 0) {
      const committed = this.finalizeSyllable('a') + PUNCTUATION[char]
      this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // Plus = force stacking for non-standard (Sanskrit) clusters
    if (char === '+') {
      this.forceStack = true
      return { committed: '', buffer: this.rawBuffer + '+', consumed: true }
    }

    // Extended vowels: A, I, U (uppercase single-char vowels)
    // These finalize with the extended vowel
    if (VOWELS[char] !== undefined) {
      const committed = this.finalizeSyllable(char)
      if (committed) this.lastCommitted = committed
      return { committed, buffer: '', consumed: true }
    }

    // 'a' vowel — could be start of 'ai'/'au', so defer finalization
    if (char === 'a') {
      if (this.rawBuffer.length > 0) {
        this.pendingA = true
        return { committed: '', buffer: this.rawBuffer + 'a', consumed: true }
      }
      this.rawBuffer = 'a'
      return { committed: '', buffer: 'a', consumed: true }
    }

    // Regular consonant character — add to buffer
    this.rawBuffer += char

    // Check if the buffer can still form valid Wylie tokens
    const { exact, hasMore } = trieMatch(consonantTrie, this.getLastTokenCandidate())

    if (exact !== null || hasMore) {
      return { committed: '', buffer: this.rawBuffer, consumed: true }
    }

    // The last character doesn't continue any valid token
    const withoutLast = this.rawBuffer.slice(0, -1)

    if (withoutLast.length > 0) {
      const { tokens } = tokenize(withoutLast)
      if (tokens.length > 0) {
        return { committed: '', buffer: this.rawBuffer, consumed: true }
      }
    }

    return { committed: '', buffer: this.rawBuffer, consumed: true }
  }

  flush(): EngineResult {
    let pre = ''
    if (this.pendingSlash) {
      pre = SHAD
      this.pendingSlash = false
    }
    this.pendingTilde = false
    this.pendingDash = false
    this.pendingA = false
    if (!this.rawBuffer && !pre) return { committed: '', buffer: '', consumed: false }
    const committed = pre + this.finalizeSyllable('a')
    if (committed) this.lastCommitted = committed
    return { committed, buffer: '', consumed: committed.length > 0 }
  }

  reset(): void {
    this.rawBuffer = ''
    this.forceStack = false
    this.lastCommitted = ''
    this.pendingSlash = false
    this.pendingTilde = false
    this.pendingDash = false
    this.pendingA = false
  }

  private getLastTokenCandidate(): string {
    // Get the part of rawBuffer that forms the current (incomplete) token
    const { tokens } = tokenize(this.rawBuffer)
    const consumed = tokens.reduce((sum, t) => sum + t.length, 0)
    return this.rawBuffer.slice(consumed)
  }

  private finalizeSyllable(vowel: string): string {
    if (!this.rawBuffer) {
      if (vowel !== 'a') {
        return ALL_CONSONANTS['a'] + VOWELS[vowel]
      }
      return ''
    }

    // Handle force-stacked (Sanskrit) clusters with '+'
    if (this.rawBuffer.includes('+')) {
      return this.renderForceStacked(vowel)
    }

    const { tokens, remainder } = tokenize(this.rawBuffer)
    this.rawBuffer = ''

    if (tokens.length === 0) {
      return remainder
    }

    return renderSyllable(tokens, vowel) + remainder
  }

  private renderForceStacked(vowel: string): string {
    const parts = this.rawBuffer.split('+')
    this.rawBuffer = ''
    let out = ''
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const { tokens } = tokenize(part)
      if (tokens.length > 0) {
        for (const tok of tokens) {
          if (i === 0 && tok === tokens[0]) {
            out += ALL_CONSONANTS[tok] || ''
          } else {
            out += toSubjoined(tok)
          }
        }
      } else if (ALL_CONSONANTS[part]) {
        if (i === 0) {
          out += ALL_CONSONANTS[part]
        } else {
          const base = ALL_CONSONANTS[part]
          out += String.fromCodePoint(base.codePointAt(0)! + 0x50)
        }
      }
    }
    if (vowel && vowel !== 'a') out += VOWELS[vowel]
    return out
  }

  private flushAsSeparateChars(): string {
    const { tokens } = tokenize(this.rawBuffer)
    this.rawBuffer = ''
    return tokens.map(t => ALL_CONSONANTS[t]).join('')
  }
}
