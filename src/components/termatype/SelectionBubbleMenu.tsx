import { type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import {
  ColorHighlightPopover,
} from '@/components/tiptap-ui/color-highlight-popover'
import { TextColorPopover } from '@/components/tiptap-ui/text-color-popover'
import {
  LinkPopover,
} from '@/components/tiptap-ui/link-popover'
import { TextAlignDropdown } from '@/components/termatype/TextAlignDropdown'

export function SelectionBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      className="bubble-menu-wrapper"
      // Append outside the editor (which uses CSS `zoom`) and position with a
      // fixed strategy, so Floating UI anchors to the selection instead of
      // dropping to the top-left of the zoomed container.
      appendTo={() => document.body}
      options={{
        placement: 'top',
        offset: 8,
        strategy: 'fixed',
      }}
      shouldShow={({ state, from, to }) => {
        const { doc, selection } = state
        const isEmptyTextBlock =
          !doc.textBetween(from, to).length && selection.empty
        if (isEmptyTextBlock) return false

        const isImageSelected = editor.isActive('image')
        const isUploadSelected = editor.isActive('imageUpload')
        const isInTable = editor.isActive('table')
        if (isImageSelected || isUploadSelected || isInTable) return false

        return true
      }}
    >
      <div className="bubble-menu">
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="underline" />
        <MarkButton type="strike" />
        <span className="bubble-sep" />
        <TextColorPopover editor={editor} />
        <ColorHighlightPopover usePortal={false} />
        <LinkPopover usePortal={false} />
        <span className="bubble-sep" />
        <TextAlignDropdown editor={editor} />
      </div>
    </BubbleMenu>
  )
}
