import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export type Lang = 'en' | 'bo'

const pluginKey = new PluginKey('languageToggle')

export function createLanguageToggleExtension(
  onToggle: () => void,
  _getLang: () => Lang
) {
  return Extension.create({
    name: 'languageToggle',

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: pluginKey,
          props: {
            handleKeyDown(_view, event) {
              if (event.key === ' ' && event.ctrlKey && !event.shiftKey && !event.altKey) {
                event.preventDefault()
                onToggle()
                return true
              }
              return false
            },
          },
        }),
      ]
    },
  })
}
