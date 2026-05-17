import { useState } from 'react'
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
import {
  TextAlignButton,
  type TextAlign,
  textAlignIcons,
  isTextAlignActive,
} from '@/components/tiptap-ui/text-align-button'
import { ChevronDownIcon } from '@/components/tiptap-icons/chevron-down-icon'
import { Button } from '@/components/tiptap-ui-primitive/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from '@/components/tiptap-ui-primitive/dropdown-menu'

const ALIGNS: TextAlign[] = ['left', 'center', 'right', 'justify']

function AlignDropdown({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false)
  const active = ALIGNS.find((a) => isTextAlignActive(editor, a)) || 'left'
  const Icon = textAlignIcons[active]

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="button"
          tabIndex={-1}
          aria-label="Text alignment"
          tooltip="Alignment"
        >
          <Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" usePortal={false}>
        <DropdownMenuGroup>
          {ALIGNS.map((align) => (
            <DropdownMenuItem key={align} asChild>
              <TextAlignButton align={align} editor={editor} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SelectionBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: 'top',
        offset: 8,
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
        <AlignDropdown editor={editor} />
      </div>
    </BubbleMenu>
  )
}
