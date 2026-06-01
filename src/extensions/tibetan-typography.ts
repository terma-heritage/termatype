/**
 * Tibetan Typography Extension for Tiptap
 *
 * terma.prepare() is NOT run in the live editor — it mutates the DOM
 * which conflicts with ProseMirror's document model and the Wylie IME.
 *
 * Instead:
 * - CSS handles line breaking (overflow-wrap: anywhere)
 * - terma.prepare() runs only at print/export time (see print.ts)
 *
 * This extension is kept as a placeholder for future Tibetan-specific
 * editor enhancements that work through ProseMirror's proper APIs
 * (decorations, transactions) rather than direct DOM mutation.
 */

import { Extension } from '@tiptap/core'

export const TibetanTypography = Extension.create({
  name: 'tibetanTypography',
})
