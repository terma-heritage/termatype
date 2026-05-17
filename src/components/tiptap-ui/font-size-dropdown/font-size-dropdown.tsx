import { forwardRef, useCallback, useState } from "react"
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

const FONT_SIZES = [
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
]

function getCurrentFontSize(editor: any): string | null {
  if (!editor) return null
  return editor.getAttributes("textStyle")?.fontSize || null
}

export interface FontSizeDropdownProps extends ButtonProps {
  editor?: any
  onOpenChange?: (isOpen: boolean) => void
  modal?: boolean
}

export const FontSizeDropdown = forwardRef<
  HTMLButtonElement,
  FontSizeDropdownProps
>(({ editor: providedEditor, onOpenChange, modal = false, ...buttonProps }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!editor) return
      setIsOpen(open)
      onOpenChange?.(open)
    },
    [editor, onOpenChange]
  )

  const handleSelect = useCallback(
    (size: string | null) => {
      if (!editor) return
      if (size) {
        editor.chain().focus().setFontSize(size).run()
      } else {
        editor.chain().focus().unsetFontSize().run()
      }
      setIsOpen(false)
    },
    [editor]
  )

  if (!editor) return null

  const currentSize = getCurrentFontSize(editor)
  const displaySize = currentSize ? currentSize.replace("px", "") : "18"

  return (
    <DropdownMenu modal={modal} open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="button"
          tabIndex={-1}
          aria-label="Font size"
          tooltip="Font size"
          {...buttonProps}
          ref={ref}
        >
          <span className="font-size-dropdown__label">{displaySize}</span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => handleSelect(null)}>
            <Button
              type="button"
              variant="ghost"
              role="menuitem"
              data-active-state={!currentSize ? "on" : "off"}
              style={{ width: "100%", justifyContent: "flex-start" }}
            >
              Default
            </Button>
          </DropdownMenuItem>
          {FONT_SIZES.map(({ label, value }) => (
            <DropdownMenuItem key={value} onSelect={() => handleSelect(value)}>
              <Button
                type="button"
                variant="ghost"
                role="menuitem"
                data-active-state={currentSize === value ? "on" : "off"}
                style={{ width: "100%", justifyContent: "flex-start", fontSize: value }}
              >
                {label}
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

FontSizeDropdown.displayName = "FontSizeDropdown"

export default FontSizeDropdown
