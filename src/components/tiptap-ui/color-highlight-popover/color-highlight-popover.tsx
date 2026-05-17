import { forwardRef, useCallback, useRef, useState } from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
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

// --- Tiptap UI ---
import type {
  HighlightColor,
  UseColorHighlightConfig,
} from "@/components/tiptap-ui/color-highlight-button"
import {
  ColorHighlightButton,
  pickHighlightColorsByValue,
  useColorHighlight,
} from "@/components/tiptap-ui/color-highlight-button"

const STORAGE_KEY = "termatype-recent-highlight-colors"
const MAX_RECENT = 5

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

export interface ColorHighlightPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[]
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean
}

export interface ColorHighlightPopoverProps
  extends
    Omit<ButtonProps, "type">,
    Pick<
      UseColorHighlightConfig,
      "editor" | "hideWhenUnavailable" | "onApplied"
    > {
  /**
   * Optional colors to use in the highlight popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: HighlightColor[]
  /**
   * When true, uses the actual color value (colorValue) instead of CSS variable (value).
   * @default false
   */
  useColorValue?: boolean
}

export const ColorHighlightPopoverButton = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    type="button"
    className={className}
    variant="ghost"
    data-appearance="default"
    role="button"
    tabIndex={-1}
    aria-label="Highlight text"
    tooltip="Highlight"
    ref={ref}
    {...props}
  >
    {children ?? <HighlighterIcon className="tiptap-button-icon" />}
  </Button>
))

ColorHighlightPopoverButton.displayName = "ColorHighlightPopoverButton"

export function ColorHighlightPopoverContent({
  editor,
  colors = pickHighlightColorsByValue([
    "var(--tt-color-highlight-green)",
    "var(--tt-color-highlight-blue)",
    "var(--tt-color-highlight-red)",
    "var(--tt-color-highlight-purple)",
    "var(--tt-color-highlight-yellow)",
  ]),
  useColorValue = false,
}: ColorHighlightPopoverContentProps) {
  const { handleRemoveHighlight } = useColorHighlight({ editor })
  const isMobile = useIsBreakpoint()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [recentColors, setRecentColors] = useState<string[]>(getRecentColors)
  const { editor: resolvedEditor } = useTiptapEditor(editor)

  const handleCustomColor = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value
      if (!resolvedEditor) return
      resolvedEditor.chain().focus().setHighlight({ color }).run()
      setRecentColors(addRecentColor(color))
    },
    [resolvedEditor]
  )

  const handleRecentColor = useCallback(
    (color: string) => {
      if (!resolvedEditor) return
      resolvedEditor.chain().focus().setHighlight({ color }).run()
      setRecentColors(addRecentColor(color))
    },
    [resolvedEditor]
  )

  // Get the current highlight color for the native picker default
  const currentHighlightColor =
    (resolvedEditor?.getAttributes("highlight")?.color as string) || "#fef9c3"

  return (
    <Card
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <div className="color-picker-panel">
          {/* Preset swatches using ColorHighlightButton */}
          <div className="color-picker-section">
            <div className="color-picker-swatches">
              {colors.map((color) => (
                <ColorHighlightButton
                  key={color.value}
                  editor={editor}
                  highlightColor={useColorValue ? color.colorValue : color.value}
                  tooltip={color.label}
                  aria-label={`${color.label} highlight color`}
                  useColorValue={useColorValue}
                  className="color-picker-highlight-btn"
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
                    aria-label={`Recent highlight ${color}`}
                    onClick={() => handleRecentColor(color)}
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
                style={{ backgroundColor: currentHighlightColor }}
              />
              <span className="color-picker-custom-label">Custom...</span>
            </button>
            <input
              ref={colorInputRef}
              type="color"
              className="color-picker-native-input"
              value={currentHighlightColor.startsWith("#") ? currentHighlightColor : "#fef9c3"}
              onChange={handleCustomColor}
              aria-label="Choose custom highlight color"
            />
          </div>

          <Separator />

          {/* Remove button */}
          <div className="color-picker-section">
            <Button
              onClick={handleRemoveHighlight}
              aria-label="Remove highlight"
              tooltip="Remove highlight"
              type="button"
              role="menuitem"
              variant="ghost"
              className="color-picker-remove-btn"
            >
              <BanIcon className="tiptap-button-icon" />
              <span>Remove highlight</span>
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export function ColorHighlightPopover({
  editor: providedEditor,
  colors = pickHighlightColorsByValue([
    "var(--tt-color-highlight-green)",
    "var(--tt-color-highlight-blue)",
    "var(--tt-color-highlight-red)",
    "var(--tt-color-highlight-purple)",
    "var(--tt-color-highlight-yellow)",
  ]),
  hideWhenUnavailable = false,
  useColorValue = false,
  onApplied,
  usePortal = true,
  ...props
}: ColorHighlightPopoverProps & { usePortal?: boolean }) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)
  const { isVisible, canColorHighlight, isActive, label, Icon } =
    useColorHighlight({
      editor,
      hideWhenUnavailable,
      onApplied,
    })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorHighlightPopoverButton
          disabled={!canColorHighlight}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canColorHighlight}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className="tiptap-button-icon" />
        </ColorHighlightPopoverButton>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Highlight colors"
        usePortal={usePortal}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
      >
        <ColorHighlightPopoverContent
          editor={editor}
          colors={colors}
          useColorValue={useColorValue}
        />
      </PopoverContent>
    </Popover>
  )
}

export default ColorHighlightPopover
