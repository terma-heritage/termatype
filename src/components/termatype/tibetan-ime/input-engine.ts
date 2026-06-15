// Shared contract for Tibetan input methods (Wylie, TCRC, …).
//
// Both engines are stateful per-keystroke transducers with the SAME surface, so
// the editor binding can swap between them without caring which is active. An
// engine only manages buffering and commit timing; it never owns the editor.

export interface EngineResult {
  /** Tibetan text to insert into the document. */
  committed: string
  /** Raw input still being composed, shown as the preedit buffer. */
  buffer: string
  /** Whether the keystroke was handled by the IME. */
  consumed: boolean
}

export interface InputEngine {
  /** Feed a single typed character. */
  feed(char: string): EngineResult
  /** Remove the last character from the preedit buffer. */
  backspace(): EngineResult
  /** Commit any pending buffer (e.g. on Enter, blur, mode switch). */
  flush(): EngineResult
  /** Discard all pending state. */
  reset(): void
}

export type TibetanInputMethod = 'wylie' | 'tcrc'
