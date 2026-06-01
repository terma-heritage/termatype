import { forwardRef, useCallback, useState, useEffect } from "react"
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
import { invoke } from "@/lib/safe-invoke"
interface FontEntry {
  label: string
  value: string | null
  preview: string
}

// Bundled with TermaType — always available
const TERMATYPE_FONTS: FontEntry[] = [
  { label: "DDC Uchen", value: "DDC Uchen, Noto Serif Tibetan, serif", preview: "DDC Uchen, serif" },
  { label: "Jomolhari", value: "Jomolhari, Noto Serif Tibetan, serif", preview: "Jomolhari, serif" },
  { label: "Noto Serif Tibetan", value: "Noto Serif Tibetan, serif", preview: "Noto Serif Tibetan, serif" },
  { label: "Monlam Bodyig", value: "Monlam Bodyig, Noto Serif Tibetan, serif", preview: "Monlam Bodyig, serif" },
  { label: "Qomolangma Drutsa", value: "Qomolangma Drutsa, Noto Serif Tibetan, serif", preview: "Qomolangma Drutsa, serif" },
  { label: "Tibetan Machine Uni", value: "Tibetan Machine Uni, Noto Serif Tibetan, serif", preview: "Tibetan Machine Uni, serif" },
]

const COMMON_FONTS: FontEntry[] = [
  { label: "Default", value: null, preview: "Source Serif 4, serif" },
  { label: "Source Serif", value: "Source Serif 4, Source Serif Pro, Georgia, serif", preview: "Source Serif 4, serif" },
  { label: "Georgia", value: "Georgia, Palatino Linotype, serif", preview: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif", preview: "Times New Roman, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif", preview: "Arial, sans-serif" },
]

// Names to exclude from system fonts (already in our lists above)
const EXCLUDE_NAMES = new Set([
  'jomolhari', 'noto serif tibetan', 'monlam bodyig', 'qomolangma drutsa',
  'tibetan machine uni', 'source serif', 'source serif 4', 'source serif pro',
  'georgia', 'times new roman', 'arial', 'consolas',
])

function getCurrentFontFamily(editor: any): string | null {
  if (!editor) return null
  return editor.getAttributes("textStyle")?.fontFamily || null
}

function getDisplayName(fontFamily: string | null, allFonts: FontEntry[]): string {
  if (!fontFamily) return "Font"
  const match = allFonts.find((f) => f.value === fontFamily)
  if (match) return match.label
  // Strip quotes and take first family name
  const cleaned = fontFamily.replace(/['"]/g, "")
  const first = (cleaned.split(",")[0] ?? cleaned).trim()
  return first || "Font"
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
  const [systemFonts, setSystemFonts] = useState<FontEntry[]>([])

  useEffect(() => {
    invoke<string[]>('get_system_fonts').then((names) => {
      const fonts: FontEntry[] = names
        .filter(name => !EXCLUDE_NAMES.has(name.toLowerCase()))
        .map(name => ({
          label: name,
          value: name,
          preview: name,
        }))
      setSystemFonts(fonts)
    }).catch(() => {})
  }, [])

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

  const allFonts = [...TERMATYPE_FONTS, ...COMMON_FONTS, ...systemFonts]
  const currentFamily = getCurrentFontFamily(editor)
  const displayName = getDisplayName(currentFamily, allFonts)

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

      <DropdownMenuContent align="start" className="font-family-dropdown-content">
        <DropdownMenuGroup>
          <div className="font-family-section-label">TermaType</div>
          {TERMATYPE_FONTS.map((item) => (
            <DropdownMenuItem key={item.label} onSelect={() => handleSelect(item.value)}>
              <Button
                type="button"
                variant="ghost"
                role="menuitem"
                data-active-state={currentFamily === item.value ? "on" : "off"}
                style={{ width: "100%", justifyContent: "flex-start", fontFamily: item.preview }}
              >
                {item.label}
              </Button>
            </DropdownMenuItem>
          ))}

          <div className="font-family-separator" />

          {COMMON_FONTS.map((item) => (
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
                style={{ width: "100%", justifyContent: "flex-start", fontFamily: item.preview }}
              >
                {item.label}
              </Button>
            </DropdownMenuItem>
          ))}

          {systemFonts.length > 0 && (
            <>
              <div className="font-family-separator" />
              <div className="font-family-section-label">System</div>
              {systemFonts.map((item) => (
                <DropdownMenuItem key={item.label} onSelect={() => handleSelect(item.value)}>
                  <Button
                    type="button"
                    variant="ghost"
                    role="menuitem"
                    data-active-state={currentFamily === item.value ? "on" : "off"}
                    style={{ width: "100%", justifyContent: "flex-start", fontFamily: item.preview }}
                  >
                    {item.label}
                  </Button>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

FontFamilyDropdown.displayName = "FontFamilyDropdown"

export default FontFamilyDropdown
