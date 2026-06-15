import { wylieToUnicode } from './ewts'

export interface EngineResult {
  /** Tibetan text to insert into the document. */
  committed: string
  /** Raw Wylie still being composed, shown as the preedit buffer. */
  buffer: string
  /** Whether the keystroke was handled by the IME. */
  consumed: boolean
}

/**
 * Stateful per-keystroke adapter around the EWTS batch converter.
 *
 * The hard part — stacking, Sanskrit, marks, head marks, tsheg/spacing — is
 * fully delegated to {@link wylieToUnicode} (the proven `tibetan-ewts-converter`
 * library). This class only buffers the Wylie for the syllable being typed and
 * decides *when* to commit:
 *
 *  - typing extends the buffer and shows it as the preedit (raw Wylie);
 *  - a space ends the syllable — the buffer plus the space is converted, so the
 *    space becomes a tsheg (`bskyod ` → `བསྐྱོད་`);
 *  - {@link flush} commits whatever is pending without a trailing tsheg.
 *
 * The `feed/flush/reset` contract is unchanged from the previous hand-rolled
 * engine, so the TipTap extension and other consumers need no changes.
 */
export class WylieEngine {
  private raw = ''

  /** Feed a single typed character. */
  feed(char: string): EngineResult {
    if (char === ' ') {
      // Nothing pending: emit a literal space (e.g. a deliberate second space).
      if (!this.raw) {
        return { committed: ' ', buffer: '', consumed: true }
      }
      // End of syllable — let the converter turn the trailing space into a
      // tsheg (and correctly avoid doubling it after a shad / punctuation).
      const committed = wylieToUnicode(this.raw + ' ')
      this.raw = ''
      return { committed, buffer: '', consumed: true }
    }

    // Any other character extends the current syllable's preedit buffer.
    this.raw += char
    return { committed: '', buffer: this.raw, consumed: true }
  }

  /** Remove the last character from the preedit buffer. */
  backspace(): EngineResult {
    if (!this.raw) return { committed: '', buffer: '', consumed: false }
    this.raw = this.raw.slice(0, -1)
    return { committed: '', buffer: this.raw, consumed: true }
  }

  /** Commit any pending buffer (no trailing tsheg). */
  flush(): EngineResult {
    if (!this.raw) return { committed: '', buffer: '', consumed: false }
    const committed = wylieToUnicode(this.raw)
    this.raw = ''
    return { committed, buffer: '', consumed: committed.length > 0 }
  }

  /** Discard all pending state. */
  reset(): void {
    this.raw = ''
  }
}
