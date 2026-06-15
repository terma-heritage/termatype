import { EwtsConverter } from 'tibetan-ewts-converter/EwtsConverter'

/**
 * Single shared EWTS converter for the whole app.
 *
 * `tibetan-ewts-converter` (ewts-js) is the reference EWTS implementation by
 * Roger Espel Llima — the author of the original Wylie/EWTS converter. It is
 * the single source of truth for all Wylie ↔ Tibetan conversion here: typing
 * IME, find/replace and the practice page all go through this module.
 *
 * `fix_spacing` (on by default) lets the library normalise tsheg/spacing for
 * us, so a trailing space becomes a tsheg (`ka ` → `ཀ་`) without doubling
 * after a shad.
 */
const converter = new EwtsConverter()

/** Convert an EWTS (Extended Wylie) string to Tibetan Unicode. */
export function wylieToUnicode(input: string): string {
  if (!input) return ''
  return converter.to_unicode(input)
}
