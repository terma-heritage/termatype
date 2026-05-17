import { Node, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType
    }
  }
}

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  draggable: true,

  parseHTML() {
    return [
      { tag: 'div[data-type="pageBreak"]' },
      { tag: 'div[style*="page-break"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "pageBreak",
        style: "page-break-after: always;",
      }),
    ]
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain }) => {
          return chain().insertContent({ type: this.name }).run()
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => this.editor.commands.setPageBreak(),
    }
  },
})

export default PageBreak
