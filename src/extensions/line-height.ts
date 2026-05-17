import { Extension } from '@tiptap/react'

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (height: string) => ReturnType
      unsetLineHeight: () => ReturnType
    }
  }
}

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        (height: string) =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!['paragraph', 'heading'].includes(node.type.name)) return
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, lineHeight: height })
          })
          if (dispatch) dispatch(tr)
          return true
        },
      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }) => {
          const { from, to } = state.selection
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!['paragraph', 'heading'].includes(node.type.name)) return
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, lineHeight: null })
          })
          if (dispatch) dispatch(tr)
          return true
        },
    }
  },
})
