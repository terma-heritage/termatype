import { Extension } from '@tiptap/react'

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
  }
}

const INDENT_STEP = 40
const MAX_INDENT = 200

export const Indent = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const ml = element.style.marginLeft
              return ml ? parseInt(ml, 10) || 0 : 0
            },
            renderHTML: (attributes) => {
              if (!attributes.indent || attributes.indent <= 0) return {}
              return { style: `margin-left: ${attributes.indent}px` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!['paragraph', 'heading', 'blockquote'].includes(node.type.name)) return
            const current = node.attrs.indent || 0
            if (current >= MAX_INDENT) return
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: current + INDENT_STEP })
          })
          if (dispatch) dispatch(tr)
          return true
        },
      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!['paragraph', 'heading', 'blockquote'].includes(node.type.name)) return
            const current = node.attrs.indent || 0
            if (current <= 0) return
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: Math.max(0, current - INDENT_STEP) })
          })
          if (dispatch) dispatch(tr)
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    }
  },
})
