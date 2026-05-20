import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { invoke } from '@/lib/safe-invoke'

const spellcheckKey = new PluginKey('tibetanSpellcheck')

/** Extract Tibetan words from text, splitting on tshegs (U+0F0D ་) and shads (U+0F0B ། ) */
function extractTibetanWords(text: string): { word: string; from: number; to: number }[] {
  const results: { word: string; from: number; to: number }[] = []
  // Match sequences of Tibetan Unicode characters (U+0F00 - U+0FFF)
  const tibetanRegex = /[ༀ-࿿]+/g
  let match
  while ((match = tibetanRegex.exec(text)) !== null) {
    const fullMatch = match[0]
    const baseIndex = match.index

    // Split on tshegs (་ U+0F0D) and shads (། U+0F0B) to get individual syllables
    // Then check each syllable individually
    let pos = 0
    const parts = fullMatch.split(/[།་]/)
    for (const part of parts) {
      // Find this part's position within the full match
      const partStart = fullMatch.indexOf(part, pos)
      if (part.length > 0 && /[ཀ-ྼ]/.test(part)) {
        // Only include parts that contain actual Tibetan letters (not just marks/symbols)
        results.push({
          word: part,
          from: baseIndex + partStart,
          to: baseIndex + partStart + part.length,
        })
      }
      pos = partStart + part.length + 1 // +1 for the separator
    }
  }
  return results
}

export const TibetanSpellcheck = Extension.create({
  name: 'tibetanSpellcheck',

  addProseMirrorPlugins() {
    let checkTimeout: ReturnType<typeof setTimeout> | null = null

    return [
      new Plugin({
        key: spellcheckKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, old) {
            const meta = tr.getMeta(spellcheckKey)
            if (meta) return meta
            if (tr.docChanged) return old.map(tr.mapping, tr.doc)
            return old
          },
        },
        props: {
          decorations(state) {
            return spellcheckKey.getState(state)
          },
        },
        view() {
          return {
            update(view) {
              if (checkTimeout) clearTimeout(checkTimeout)
              checkTimeout = setTimeout(async () => {
                // Capture the doc before the async gap so we can detect stale dispatches
                const docBefore = view.state.doc

                // Extract all Tibetan words with their document positions
                const tibetanWords: { word: string; from: number; to: number }[] = []

                docBefore.descendants((node, pos) => {
                  if (!node.isText || !node.text) return
                  const matches = extractTibetanWords(node.text)
                  for (const m of matches) {
                    tibetanWords.push({
                      word: m.word,
                      from: pos + m.from,
                      to: pos + m.to,
                    })
                  }
                })

                if (tibetanWords.length === 0) {
                  // Check for stale doc before dispatching
                  if (view.state.doc !== docBefore) return
                  const tr = view.state.tr.setMeta(spellcheckKey, DecorationSet.empty)
                  view.dispatch(tr)
                  return
                }

                // Deduplicate words for the backend call
                const uniqueWords = [...new Set(tibetanWords.map((w) => w.word))]

                try {
                  const misspelled = await invoke<string[]>('spellcheck_tibetan', {
                    words: uniqueWords,
                  })
                  const misspelledSet = new Set(misspelled)

                  // Doc changed during await — skip dispatch, next debounced run will handle it
                  if (view.state.doc !== docBefore) return

                  const decos = tibetanWords
                    .filter((w) => misspelledSet.has(w.word))
                    .map((w) =>
                      Decoration.inline(w.from, w.to, {
                        class: 'tibetan-misspelled',
                        title: 'Word not found in dictionary',
                      })
                    )

                  const decoSet = DecorationSet.create(view.state.doc, decos)
                  const tr = view.state.tr.setMeta(spellcheckKey, decoSet)
                  view.dispatch(tr)
                } catch {
                  // Silently fail — dictionary plugin may not be installed
                }
              }, 1000) // Debounce: check 1 second after last edit
            },
            destroy() {
              if (checkTimeout) clearTimeout(checkTimeout)
            },
          }
        },
      }),
    ]
  },
})
