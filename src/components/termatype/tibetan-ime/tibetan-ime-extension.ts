import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { EditorView } from '@tiptap/pm/view'
import { WylieEngine } from './wylie-engine'
import { TcrcEngine } from './tcrc-engine'
import type { InputEngine, TibetanInputMethod } from './input-engine'
import type { Lang } from '../LanguageToggle'

const imePluginKey = new PluginKey('tibetanIME')

interface IMEState {
  buffer: string
}

export function createTibetanIMEExtension(
  getLang: () => Lang,
  getInputMethod: () => TibetanInputMethod = () => 'wylie'
) {
  return Extension.create({
    name: 'tibetanIME',
    addProseMirrorPlugins() {
      const wylie = new WylieEngine()
      const tcrc = new TcrcEngine()
      let activeMethod = getInputMethod()

      // Return the engine for the current input method, resetting both on a
      // switch so no preedit leaks across methods.
      const engine = (): InputEngine => {
        const method = getInputMethod()
        if (method !== activeMethod) {
          wylie.reset()
          tcrc.reset()
          activeMethod = method
        }
        return method === 'tcrc' ? tcrc : wylie
      }

      const commitPending = (view: EditorView) => {
        const result = engine().flush()
        if (result.committed) {
          const tr = view.state.tr.insertText(
            result.committed,
            view.state.selection.from
          )
          tr.setMeta(imePluginKey, { buffer: '' })
          view.dispatch(tr)
        } else if ((imePluginKey.getState(view.state) as IMEState).buffer) {
          view.dispatch(view.state.tr.setMeta(imePluginKey, { buffer: '' }))
        }
      }

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
                engine().reset()
                return false
              }

              // Ctrl+Space is the language toggle — flush but don't consume.
              if (event.key === ' ' && event.ctrlKey) {
                commitPending(view)
                return false
              }

              // Any modifier combo ends composition and passes through.
              if (event.ctrlKey || event.metaKey || event.altKey) {
                commitPending(view)
                return false
              }

              // Backspace edits the preedit one character at a time.
              if (event.key === 'Backspace') {
                const result = engine().backspace()
                if (result.consumed) {
                  view.dispatch(
                    view.state.tr.setMeta(imePluginKey, { buffer: result.buffer })
                  )
                  return true
                }
                return false
              }

              // Keys that move the cursor or end the line commit first.
              if (
                event.key === 'Escape' ||
                event.key === 'Enter' ||
                event.key === 'Tab' ||
                event.key.startsWith('Arrow')
              ) {
                commitPending(view)
                return false
              }

              return false
            },

            handleTextInput(view, from, to, text) {
              if (getLang() !== 'bo') return false
              if (text.length !== 1) return false

              const result = engine().feed(text)
              if (!result.consumed) return false

              const tr = view.state.tr
              if (result.committed) {
                tr.insertText(result.committed, from, to)
              } else if (from !== to) {
                tr.delete(from, to)
              }

              tr.setMeta(imePluginKey, { buffer: result.buffer })
              view.dispatch(tr)
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
