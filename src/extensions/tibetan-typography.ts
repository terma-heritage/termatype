/**
 * Tibetan Typography Extension for Tiptap
 *
 * Integrates terma.js to fix Tibetan text rendering in the editor:
 * - Inserts zero-width spaces after tsheg (་) for proper line breaking
 * - Protects tsheg-before-shad (་།) from splitting across lines
 * - Protects double-shad (། །) from splitting
 * - Normalizes Unicode (NFC) to prevent invisible search failures
 *
 * This is a thin wrapper — all logic lives in terma.js.
 * To disable: remove this extension from the editor config in App.tsx.
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

// Import terma.js ESM build
import terma from '@/lib/terma.esm.js'

const tibetanTypographyKey = new PluginKey('tibetanTypography')

const TIBETAN_RE = /[ༀ-࿿]/
const DEBOUNCE_MS = 300

export const TibetanTypography = Extension.create({
  name: 'tibetanTypography',

  addProseMirrorPlugins() {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    return [
      new Plugin({
        key: tibetanTypographyKey,

        view() {
          return {
            update(view) {
              // Debounce to avoid processing on every keystroke
              if (debounceTimer) clearTimeout(debounceTimer)
              debounceTimer = setTimeout(() => {
                const editorEl = view.dom
                if (!editorEl) return

                // Only process if there's Tibetan text in the document
                const text = view.state.doc.textContent
                if (!TIBETAN_RE.test(text)) return

                // Reset the prepared flag so terma.js re-processes
                delete (editorEl as HTMLElement).dataset.termaPrepared

                // Run terma.prepare() on the editor DOM
                // This inserts ZWS after tsheg, protects shad, etc.
                try {
                  terma.prepare(editorEl)
                } catch {
                  // Silently fail — never break the editor
                }
              }, DEBOUNCE_MS)
            },
            destroy() {
              if (debounceTimer) clearTimeout(debounceTimer)
            },
          }
        },
      }),
    ]
  },
})
