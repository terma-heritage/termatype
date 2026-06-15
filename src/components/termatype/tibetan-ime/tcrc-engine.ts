import type { EngineResult, InputEngine } from './input-engine'
import { TCRC_KEYMAP, toSubjoined } from './tcrc-map'

const TSHEG = '་'
const SHAD = '།'
const NGA = 'ང'

const NOT_CONSUMED: EngineResult = { committed: '', buffer: '', consumed: false }

/**
 * TCRC (Bodyig) positional keyboard.
 *
 * Unlike Wylie, TCRC commits on every keystroke — there is no preedit buffer to
 * convert. The only state is the halant dead-key (`pendingSubjoin`) and the last
 * committed glyph (for tsheg/shad rules). All key→glyph data lives in tcrc-map.ts.
 */
export class TcrcEngine implements InputEngine {
  private pendingSubjoin = false
  private lastCommitted = ''

  feed(char: string): EngineResult {
    // Space → tsheg; a second consecutive space emits a real space (chart rule
    // "one press = tsheg, two press = tsheg and space").
    if (char === ' ') {
      this.pendingSubjoin = false
      const out = this.lastCommitted === TSHEG ? ' ' : TSHEG
      return this.commit(out)
    }

    // Shad after nga auto-inserts a tsheg (ང → ང་།), per the chart's tsheg rule.
    if (char === '/') {
      this.pendingSubjoin = false
      const out = this.lastCommitted === NGA ? TSHEG + SHAD : SHAD
      return this.commit(out)
    }

    const entry = TCRC_KEYMAP[char]
    if (!entry) {
      // Not a TCRC key — let the editor handle it (and end any pending stack).
      this.pendingSubjoin = false
      return NOT_CONSUMED
    }

    switch (entry.kind) {
      case 'halant':
        // Dead key: the next consonant becomes subjoined. Nothing emitted yet.
        this.pendingSubjoin = true
        return { committed: '', buffer: '', consumed: true }

      case 'super':
        // Head letter (rago/lago/sago): emit it, then subjoin the next consonant.
        this.pendingSubjoin = true
        return this.commit(entry.out)

      case 'consonant': {
        const out = this.pendingSubjoin ? toSubjoined(entry.out) : entry.out
        this.pendingSubjoin = false
        return this.commit(out)
      }

      default:
        // vowel / subjoined / mark / digit — emit directly.
        this.pendingSubjoin = false
        return this.commit(entry.out)
    }
  }

  backspace(): EngineResult {
    // If a halant is armed, cancel it instead of deleting a character.
    if (this.pendingSubjoin) {
      this.pendingSubjoin = false
      return { committed: '', buffer: '', consumed: true }
    }
    this.lastCommitted = ''
    return NOT_CONSUMED
  }

  flush(): EngineResult {
    // TCRC commits eagerly; nothing is ever pending in the document buffer.
    this.pendingSubjoin = false
    return NOT_CONSUMED
  }

  reset(): void {
    this.pendingSubjoin = false
    this.lastCommitted = ''
  }

  private commit(out: string): EngineResult {
    if (out) this.lastCommitted = out.slice(-1)
    return { committed: out, buffer: '', consumed: true }
  }
}
