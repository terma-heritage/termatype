import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { WylieEngine } from './wylie-engine'
import type { Lang } from '../LanguageToggle'

const imePluginKey = new PluginKey('tibetanIME')

interface IMEState {
  buffer: string
}

export function createTibetanIMEExtension(
  getLang: () => Lang,
  onToggle: () => void
) {
  return Extension.create({
    name: 'tibetanIME',
    addProseMirrorPlugins() {
      const engine = new WylieEngine()

      return [
        new Plugin({
          key: imePluginKey,
          state: {
            init(): IMEState {
              return { buffer: '' }
            },
            apply(tr, prev): IMEState {
              const meta = tr.getMeta(imePluginKey)
              if (meta !== undefined) return meta
              return prev
            },
          },
          props: {
            handleKeyDown(view, event) {
              if (getLang() !== 'bo') {
                engine.reset()
                return false
              }

              // Ctrl+Space is the language toggle — flush buffer but don't consume
              if (event.key === ' ' && event.ctrlKey) {
                const result = engine.flush()
                if (result.committed) {
                  const { state, dispatch } = view
                  const tr = state.tr.insertText(
                    result.committed,
                    state.selection.from
                  )
                  tr.setMeta(imePluginKey, { buffer: '' })
                  dispatch(tr)
                }
                return false
              }

              if (event.ctrlKey || event.metaKey || event.altKey) {
                const result = engine.flush()
                if (result.committed) {
                  const { state, dispatch } = view
                  const tr = state.tr.insertText(
                    result.committed,
                    state.selection.from
                  )
                  tr.setMeta(imePluginKey, { buffer: '' })
                  dispatch(tr)
                }
                return false
              }

              if (event.key === 'Backspace') {
                const imeState = imePluginKey.getState(
                  view.state
                ) as IMEState
                if (imeState.buffer) {
                  engine.reset()
                  const tr = view.state.tr.setMeta(imePluginKey, {
                    buffer: '',
                  })
                  view.dispatch(tr)
                  return true
                }
                return false
              }

              if (event.key === 'Escape') {
                const result = engine.flush()
                if (result.committed) {
                  const tr = view.state.tr.insertText(
                    result.committed,
                    view.state.selection.from
                  )
                  tr.setMeta(imePluginKey, { buffer: '' })
                  view.dispatch(tr)
                }
                return false
              }

              if (
                event.key === 'Enter' ||
                event.key === 'Tab' ||
                event.key.startsWith('Arrow')
              ) {
                const result = engine.flush()
                if (result.committed) {
                  const tr = view.state.tr.insertText(
                    result.committed,
                    view.state.selection.from
                  )
                  tr.setMeta(imePluginKey, { buffer: '' })
                  view.dispatch(tr)
                }
                return false
              }

              return false
            },

            handleTextInput(view, from, to, text) {
              if (getLang() !== 'bo') return false
              if (text.length !== 1) return false

              const result = engine.feed(text)

              if (!result.consumed) return false

              const { state, dispatch } = view
              const tr = state.tr

              if (result.committed) {
                tr.insertText(result.committed, from, to)
              } else {
                if (from !== to) {
                  tr.delete(from, to)
                }
              }

              tr.setMeta(imePluginKey, { buffer: result.buffer })
              dispatch(tr)
              return true
            },

            decorations(state) {
              const imeState = imePluginKey.getState(state) as IMEState
              if (!imeState?.buffer) return DecorationSet.empty

              const pos = state.selection.from
              return DecorationSet.create(state.doc, [
                Decoration.widget(pos, () => {
                  const span = document.createElement('span')
                  span.className = 'tibetan-ime-buffer'
                  span.textContent = imeState.buffer
                  return span
                }),
              ])
            },
          },
        }),
      ]
    },
  })
}
