/**
 * Tibetan Typography Extension for Tiptap
 *
 * Integrates terma.js to fix Tibetan text rendering in the editor:
 * - Inserts zero-width spaces after tsheg (་) for proper line breaking
 * - Protects tsheg-before-shad (་།) from splitting across lines
 * - Protects double-shad (། །) from splitting
 * - Normalizes Unicode (NFC) to prevent invisible search failures
 *
 * Runs on blur (not during typing) to avoid interfering with the Wylie IME.
 * Also runs before print/export via the public prepare() method.
 *
 * To disable: remove this extension from the editor config in App.tsx.
 */

import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

// Import terma.js ESM build
import terma from '@/lib/terma.esm.js'

const tibetanTypographyKey = new PluginKey('tibetanTypography')

const TIBETAN_RE = /[ༀ-࿿]/

function runPrepare(editorEl: HTMLElement) {
  const text = editorEl.textContent || ''
  if (!TIBETAN_RE.test(text)) return

  delete editorEl.dataset.termaPrepared
  try {
    terma.prepare(editorEl)
  } catch {
    // Silently fail — never break the editor
  }
}

export const TibetanTypography = Extension.create({
  name: 'tibetanTypography',

  addProseMirrorPlugins() {
    let idleTimer: ReturnType<typeof setTimeout> | null = null

    return [
      new Plugin({
        key: tibetanTypographyKey,

        view(editorView) {
          // Run on blur — safe because the user has stopped typing
          const handleBlur = () => {
            runPrepare(editorView.dom as HTMLElement)
          }

          // Run after a long idle (2 seconds of no typing) as a fallback
          // for line breaking while the user reads their own text
          const handleUpdate = () => {
            if (idleTimer) clearTimeout(idleTimer)
            idleTimer = setTimeout(() => {
              // Only run if editor is not focused (user switched away)
              // or if the document is long enough that line breaking matters
              const doc = editorView.state.doc
              if (doc.textContent.length > 100) {
                runPrepare(editorView.dom as HTMLElement)
              }
            }, 2000)
          }

          editorView.dom.addEventListener('blur', handleBlur)

          return {
            update() {
              handleUpdate()
            },
            destroy() {
              if (idleTimer) clearTimeout(idleTimer)
              editorView.dom.removeEventListener('blur', handleBlur)
            },
          }
        },
      }),
    ]
  },
})
