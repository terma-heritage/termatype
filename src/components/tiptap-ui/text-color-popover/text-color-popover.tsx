import { useCallback, useRef, useState } from "react"
import { type Editor } from "@tiptap/react"

import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
} from "@/components/tiptap-ui-primitive/card"

const STORAGE_KEY = "termatype-recent-text-colors"
const MAX_RECENT = 5

const PRESET_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Dark Gray", value: "#4b5563" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Amber", value: "#d97706" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Pink", value: "#db2777" },
]

function getRecentColors(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return []
}

function addRecentColor(color: string) {
  const recent = getRecentColors().filter((c) => c !== color)
  recent.unshift(color)
  const trimmed = recent.slice(0, MAX_RECENT)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore
  }
  return trimmed
}

interface TextColorPopoverContentProps {
  editor?: Editor | null
}

export function TextColorPopoverContent({ editor: providedEditor }: TextColorPopoverContentProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsBreakpoint()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [recentColors, setRecentColors] = useState<string[]>(getRecentColors)

  const handleSetColor = useCallback(
    (color: string) => {
      if (!editor) return
      editor.chain().focus().setColor(color).run()
      setRecentColors(addRecentColor(color))
    },
    [editor]
  )

  const handleRemoveColor = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetColor().run()
  }, [editor])

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSetColor(e.target.value)
    },
    [handleSetColor]
  )

  const currentColor =
    (editor?.getAttributes("textStyle")?.color as string) || "#000000"

  return (
    <Card
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <div className="color-picker-panel">
          {/* Preset swatches */}
          <div className="color-picker-section">
            <div className="color-picker-swatches">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className="color-picker-swatch"
                  title={color.label}
                  aria-label={`${color.label} text color`}
                  onClick={() => handleSetColor(color.value)}
                  data-active-state={
                    editor?.isActive("textStyle", { color: color.value })
                      ? "on"
                      : "off"
                  }
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div className="color-picker-section">
              <div className="color-picker-label">Recent</div>
              <div className="color-picker-swatches">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="color-picker-swatch"
                    title={color}
                    aria-label={`Recent color ${color}`}
                    onClick={() => handleSetColor(color)}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Custom color picker */}
          <div className="color-picker-section">
            <button
              type="button"
              className="color-picker-custom-btn"
              onClick={() => colorInputRef.current?.click()}
            >
              <span
                className="color-picker-swatch"
                style={{ backgroundColor: currentColor }}
              />
              <span className="color-picker-custom-label">Custom...</span>
            </button>
            <input
              ref={colorInputRef}
              type="color"
              className="color-picker-native-input"
              value={currentColor}
              onChange={handleCustomColorChange}
              aria-label="Choose custom text color"
            />
          </div>

          <Separator />

          {/* Remove button */}
          <div className="color-picker-section">
            <Button
              onClick={handleRemoveColor}
              aria-label="Remove text color"
              tooltip="Remove color"
              type="button"
              role="menuitem"
              variant="ghost"
              className="color-picker-remove-btn"
            >
              <BanIcon className="tiptap-button-icon" />
              <span>Remove color</span>
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export function TextColorPopover({ editor: providedEditor }: { editor?: Editor | null }) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const canSetColor = editor?.isEditable && !editor?.isActive("code")

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-appearance="default"
          role="button"
          tabIndex={-1}
          aria-label="Text color"
          tooltip="Text color"
          disabled={!canSetColor}
          data-disabled={!canSetColor}
        >
          <TextColorIcon className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Text colors"
        usePortal={true}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <TextColorPopoverContent editor={editor} />
      </PopoverContent>
    </Popover>
  )
}

export default TextColorPopover
