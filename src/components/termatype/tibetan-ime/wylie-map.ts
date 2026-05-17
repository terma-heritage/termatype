// @ts-nocheck

// === Basic Tibetan Consonants (30) ===
export const CONSONANTS: Record<string, string> = {
  k: 'ཀ',
  kh: 'ཁ',
  g: 'ག',
  ng: 'ང',
  c: 'ཅ',
  ch: 'ཆ',
  j: 'ཇ',
  ny: 'ཉ',
  t: 'ཏ',
  th: 'ཐ',
  d: 'ད',
  n: 'ན',
  p: 'པ',
  ph: 'ཕ',
  b: 'བ',
  m: 'མ',
  ts: 'ཙ',
  tsh: 'ཚ',
  dz: 'ཛ',
  w: 'ཝ',
  zh: 'ཞ',
  z: 'ཟ',
  "'": 'འ',
  y: 'ཡ',
  r: 'ར',
  l: 'ལ',
  sh: 'ཤ',
  s: 'ས',
  h: 'ཧ',
  a: 'ཨ',
}

// === Sanskrit Retroflex Consonants (capitals) ===
export const SANSKRIT_CONSONANTS: Record<string, string> = {
  T: 'ཊ',
  Th: 'ཋ',
  D: 'ཌ',
  N: 'ཎ',
  Sh: 'ཥ',
}

// === Vowels ===
export const VOWELS: Record<string, string> = {
  i: 'ི',
  u: 'ུ',
  e: 'ེ',
  o: 'ོ',
  A: 'ཱ',
  I: 'ཱི',
  U: 'ཱུ',
  ai: 'ཻ',
  au: 'ཽ',
  '-i': 'ྀ',
  '-I': 'ཱྀ',
}

// === Tibetan Digits ===
export const TIBETAN_DIGITS: Record<string, string> = {
  '0': '༠',
  '1': '༡',
  '2': '༢',
  '3': '༣',
  '4': '༤',
  '5': '༥',
  '6': '༦',
  '7': '༧',
  '8': '༨',
  '9': '༩',
}

// === Punctuation ===
export const TSHEG = '་'
export const SHAD = '།'
export const DOUBLE_SHAD = '༎'
export const NON_BREAKING_TSHEG = '༌'

export const PUNCTUATION: Record<string, string> = {
  '/': SHAD,
  ';': '༏',
  '|': '༑',
  '!': '༈',
  ':': '༔',
  '@': '༄༅',
  '#': '༅',
  '$': '༆',
  '%': '༇',
  '<': '༺',
  '>': '༻',
  '(': '༼',
  ')': '༽',
  '=': '༴',
  '?': '྄',
  '&': '྅',
  '^': '༹',
}

// === Sanskrit Special Marks ===
export const SANSKRIT_MARKS: Record<string, string> = {
  M: 'ཾ',
  H: 'ཿ',
  '~M': 'ྃ',
}

// === Stacking ===
export const SUBJOINED_OFFSET = 0x50

// Superscript consonants and which roots they can sit above
const SUPER_R = new Set(['k', 'g', 'ng', 'j', 'ny', 't', 'd', 'n', 'b', 'm', 'ts', 'dz'])
const SUPER_L = new Set(['k', 'g', 'ng', 'c', 'j', 't', 'd', 'p', 'b', 'h'])
const SUPER_S = new Set(['k', 'g', 'ng', 'ny', 't', 'd', 'n', 'p', 'b', 'm', 'ts'])

export const SUPERSCRIPTS: Record<string, Set<string>> = {
  r: SUPER_R,
  l: SUPER_L,
  s: SUPER_S,
}

// Subscript consonants and which roots they can sit below
const SUB_Y = new Set(['k', 'kh', 'g', 'p', 'ph', 'b', 'm'])
const SUB_R = new Set(['k', 'kh', 'g', 't', 'th', 'd', 'n', 'p', 'ph', 'b', 'm', 'sh', 's', 'h', 'dz'])
const SUB_L = new Set(['k', 'g', 'b', 'r', 's', 'z'])
const SUB_W = new Set(['k', 'kh', 'g', 'c', 'ny', 't', 'd', 'ts', 'tsh', 'zh', 'z', 'r', 'l', 'sh', 's', 'h'])

export const SUBSCRIPTS: Record<string, Set<string>> = {
  y: SUB_Y,
  r: SUB_R,
  l: SUB_L,
  w: SUB_W,
}

// Valid prefix consonants and which roots they can precede
export const PREFIXES: Record<string, Set<string>> = {
  g: new Set(['c', 'ny', 't', 'd', 'n', 'ts', 'zh', 'z', 'y', 'sh', 's']),
  d: new Set(['k', 'g', 'ng', 'p', 'b', 'm']),
  b: new Set(['k', 'g', 'c', 'j', 't', 'd', 'ts', 'zh', 'z', 'sh', 's', 'r', 'l']),
  m: new Set(['kh', 'g', 'ng', 'ch', 'j', 'ny', 'th', 'd', 'n', 'tsh', 'dz']),
  "'": new Set(['kh', 'g', 'ch', 'j', 'th', 'd', 'ph', 'b', 'tsh', 'dz']),
}

export const SUFFIXES = new Set(['g', 'ng', 'd', 'n', 'b', 'm', "'", 'r', 'l', 's'])
export const POST_SUFFIXES = new Set(['s', 'd'])

export function toSubjoined(wylie: string): string {
  const base = CONSONANTS[wylie] || SANSKRIT_CONSONANTS[wylie]
  if (!base) return ''
  return String.fromCodePoint(base.codePointAt(0)! + SUBJOINED_OFFSET)
}

// Trie for matching Wylie consonant tokens from a character stream
interface TrieNode {
  children: Map<string, TrieNode>
  value: string | null
}

function buildTrie(map: Record<string, string>): TrieNode {
  const root: TrieNode = { children: new Map(), value: null }
  for (const key of Object.keys(map)) {
    let node = root
    for (const ch of key) {
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), value: null })
      }
      node = node.children.get(ch)!
    }
    node.value = key
  }
  return root
}

export const consonantTrie = buildTrie({ ...CONSONANTS, ...SANSKRIT_CONSONANTS })

export function trieMatch(
  trie: TrieNode,
  input: string
): { exact: string | null; hasMore: boolean } {
  let node = trie
  let exact: string | null = null
  for (const ch of input) {
    const next = node.children.get(ch)
    if (!next) return { exact, hasMore: false }
    node = next
    if (node.value !== null) exact = node.value
  }
  return { exact, hasMore: node.children.size > 0 }
}

export function longestMatch(
  trie: TrieNode,
  input: string
): { value: string | null; length: number } {
  let node = trie
  let lastValue: string | null = null
  let lastLen = 0
  for (let i = 0; i < input.length; i++) {
    const next = node.children.get(input[i])
    if (!next) break
    node = next
    if (node.value !== null) {
      lastValue = node.value
      lastLen = i + 1
    }
  }
  return { value: lastValue, length: lastLen }
}
