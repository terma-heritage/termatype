import { useState } from 'react'
import { type Editor } from '@tiptap/react'
import { useTiptapEditor } from '@/hooks/use-tiptap-editor'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from '@/components/tiptap-ui-primitive/dropdown-menu'
import { Button } from '@/components/tiptap-ui-primitive/button'
import { ChevronDownIcon } from '@/components/tiptap-icons/chevron-down-icon'
import {
  TextAlignButton,
  type TextAlign,
  textAlignIcons,
  isTextAlignActive,
} from '@/components/tiptap-ui/text-align-button'

const ALIGNS: TextAlign[] = ['left', 'center', 'right', 'justify']

/**
 * Collapses the four alignment buttons into one dropdown that shows the current
 * alignment. Uses the editor from context (toolbar) or an explicit `editor`
 * prop (bubble menu).
 */
export function TextAlignDropdown({ editor: providedEditor }: { editor?: Editor | null }) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  if (!editor) return null

  const active = ALIGNS.find((a) => isTextAlignActive(editor, a)) || 'left'
  const Icon = textAlignIcons[active]

  return (
    <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" aria-label="Text alignment" tooltip="Alignment">
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
