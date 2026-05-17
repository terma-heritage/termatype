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

const FONT_FAMILIES = [
  { label: "Default", value: null, preview: "Source Serif 4, serif" },
  { label: "Source Serif", value: "Source Serif 4, Source Serif Pro, Georgia, serif", preview: "Source Serif 4, serif" },
  { label: "Georgia", value: "Georgia, Palatino Linotype, serif", preview: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif", preview: "Times New Roman, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif", preview: "Arial, sans-serif" },
  { label: "Consolas", value: "Consolas, Monaco, monospace", preview: "Consolas, monospace" },
  { label: "separator", value: null, preview: "" },
  { label: "Noto Serif Tibetan", value: "Noto Serif Tibetan, serif", preview: "Noto Serif Tibetan, serif" },
  { label: "Jomolhari", value: "Jomolhari, Noto Serif Tibetan, serif", preview: "Jomolhari, serif" },
  { label: "Monlam Bodyig", value: "Monlam Bodyig, Noto Serif Tibetan, serif", preview: "Monlam Bodyig, serif" },
  { label: "Qomolangma Drutsa", value: "Qomolangma Drutsa, Noto Serif Tibetan, serif", preview: "Qomolangma Drutsa, serif" },
  { label: "Tibetan Machine Uni", value: "Tibetan Machine Uni, Noto Serif Tibetan, serif", preview: "Tibetan Machine Uni, serif" },
]

function getCurrentFontFamily(editor: any): string | null {
  if (!editor) return null
  return editor.getAttributes("textStyle")?.fontFamily || null
}

function getDisplayName(fontFamily: string | null): string {
  if (!fontFamily) return "Font"
  const match = FONT_FAMILIES.find((f) => f.value === fontFamily)
  if (match) return match.label
  const first = (fontFamily.split(",")[0] ?? fontFamily).trim().replace(/['"]/g, "")
  return first
}

export interface FontFamilyDropdownProps extends ButtonProps {
  editor?: any
  onOpenChange?: (isOpen: boolean) => void
  modal?: boolean
}

export const FontFamilyDropdown = forwardRef<
  HTMLButtonElement,
  FontFamilyDropdownProps
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
    (family: string | null) => {
      if (!editor) return
      if (family) {
        editor.chain().focus().setFontFamily(family).run()
      } else {
        editor.chain().focus().unsetFontFamily().run()
      }
      setIsOpen(false)
    },
    [editor]
  )

  if (!editor) return null

  const currentFamily = getCurrentFontFamily(editor)
  const displayName = getDisplayName(currentFamily)

  return (
    <DropdownMenu modal={modal} open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="button"
          tabIndex={-1}
          aria-label="Font family"
          tooltip="Font family"
          {...buttonProps}
          ref={ref}
        >
          <span className="font-family-dropdown__label">{displayName}</span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          {FONT_FAMILIES.map((item, i) =>
            item.label === "separator" ? (
              <div key={i} className="font-family-separator" />
            ) : (
              <DropdownMenuItem key={item.label} onSelect={() => handleSelect(item.value)}>
                <Button
                  type="button"
                  variant="ghost"
                  role="menuitem"
                  data-active-state={
                    item.value === null
                      ? !currentFamily ? "on" : "off"
                      : currentFamily === item.value ? "on" : "off"
                  }
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    fontFamily: item.preview,
                  }}
                >
                  {item.label}
                </Button>
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

FontFamilyDropdown.displayName = "FontFamilyDropdown"

export default FontFamilyDropdown
