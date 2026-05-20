import { Extension, type Editor, type Range } from '@tiptap/core'
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from '@tiptap/suggestion'
import { createRoot, type Root } from 'react-dom/client'
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile } from '@tauri-apps/plugin-fs'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SlashCommandItem {
  title: string
  description: string
  icon: string
  command: (props: { editor: Editor; range: Range }) => void
  group: string
}

// ---------------------------------------------------------------------------
// Command definitions
// ---------------------------------------------------------------------------

const SLASH_COMMANDS: SlashCommandItem[] = [
  // ---- Blocks ----
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: 'H3',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    },
  },
  {
    title: 'Bullet List',
    description: 'Unordered list of items',
    icon: '•',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: 'Ordered List',
    description: 'Numbered list of items',
    icon: '1.',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: 'Task List',
    description: 'List with checkboxes',
    icon: '☑',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: 'Blockquote',
    description: 'Quoted text block',
    icon: '“',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run()
    },
  },
  {
    title: 'Code Block',
    description: 'Syntax-highlighted code',
    icon: '<>',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run()
    },
  },
  {
    title: 'Horizontal Rule',
    description: 'Visual divider line',
    icon: '─',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: 'Table',
    description: 'Insert a table',
    icon: '▓',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
  },
  {
    title: 'Page Break',
    description: 'Insert a page break',
    icon: '┄',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setPageBreak().run()
    },
  },
  {
    title: 'Image',
    description: 'Insert an image from your computer',
    icon: '🖼',
    group: 'Blocks',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      // Use Tauri's native file dialog to pick an image
      ;(async () => {
        try {
          const filePath = await open({
            multiple: false,
            filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'] }],
          })
          if (!filePath) return

          const bytes = await readFile(filePath as string)
          // Detect MIME type from extension
          const ext = (filePath as string).split('.').pop()?.toLowerCase() || 'png'
          const mimeMap: Record<string, string> = {
            png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
            gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
            bmp: 'image/bmp', ico: 'image/x-icon',
          }
          const mime = mimeMap[ext] || 'image/png'

          // Convert to base64 data URL
          let binary = ''
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
          const base64 = btoa(binary)
          const dataUrl = `data:${mime};base64,${base64}`

          editor.chain().focus().setImage({ src: dataUrl }).run()
        } catch (err) {
          console.error('Image insert failed:', err)
        }
      })()
    },
  },

  // ---- Format ----
  {
    title: 'Bold',
    description: 'Make text bold',
    icon: 'B',
    group: 'Format',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark('bold').run()
    },
  },
  {
    title: 'Italic',
    description: 'Make text italic',
    icon: 'I',
    group: 'Format',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark('italic').run()
    },
  },
  {
    title: 'Underline',
    description: 'Underline text',
    icon: 'U',
    group: 'Format',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark('underline').run()
    },
  },
  {
    title: 'Strikethrough',
    description: 'Strike through text',
    icon: 'S',
    group: 'Format',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark('strike').run()
    },
  },
  {
    title: 'Highlight',
    description: 'Highlight text',
    icon: '🖍',
    group: 'Format',
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMark('highlight').run()
    },
  },
]

// ---------------------------------------------------------------------------
// Shared ref for keyboard handler (closure bridge between React and TipTap)
// ---------------------------------------------------------------------------

interface KeyDownRef {
  handler: ((event: KeyboardEvent) => boolean) | null
}

// ---------------------------------------------------------------------------
// Dropdown React component
// ---------------------------------------------------------------------------

interface SlashCommandDropdownProps {
  items: SlashCommandItem[]
  command: (item: SlashCommandItem) => void
  clientRect: (() => DOMRect | null) | null
  keyDownRef: KeyDownRef
}

function SlashCommandDropdown({ items, command, clientRect, keyDownRef }: SlashCommandDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  // Scroll selected item into view
  useLayoutEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  // Expose keyboard handler to the render bridge via shared ref
  const itemsRef = useRef(items)
  itemsRef.current = items
  const selectedIndexRef = useRef(selectedIndex)
  selectedIndexRef.current = selectedIndex
  const commandRef = useRef(command)
  commandRef.current = command

  useEffect(() => {
    keyDownRef.handler = (event: KeyboardEvent): boolean => {
      const currentItems = itemsRef.current
      const idx = selectedIndexRef.current

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((i) => (i <= 0 ? currentItems.length - 1 : i - 1))
        return true
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((i) => (i >= currentItems.length - 1 ? 0 : i + 1))
        return true
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        const item = currentItems[idx]
        if (item) commandRef.current(item)
        return true
      }
      return false
    }

    return () => {
      keyDownRef.handler = null
    }
  }, [keyDownRef])

  // Position the dropdown
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!clientRect) return
    const rect = clientRect()
    if (!rect) return

    // Clamp so the dropdown doesn't overflow the viewport
    const left = Math.min(rect.left, window.innerWidth - 330)
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow < 310 ? rect.top - 310 : rect.bottom + 4

    setPos({ top, left })
  }, [clientRect, items])

  if (!items.length) return null

  // Group items preserving order
  const groups: { name: string; items: { item: SlashCommandItem; globalIndex: number }[] }[] = []
  let currentGroup: (typeof groups)[0] | null = null
  items.forEach((item, i) => {
    if (!currentGroup || currentGroup.name !== item.group) {
      currentGroup = { name: item.group, items: [] }
      groups.push(currentGroup)
    }
    currentGroup.items.push({ item, globalIndex: i })
  })

  return (
    <div
      className="slash-command-dropdown"
      style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' as const }}
    >
      {groups.map((group) => (
        <div key={group.name} className="slash-command-section">
          <div className="slash-command-group">{group.name}</div>
          {group.items.map(({ item, globalIndex }) => (
            <button
              key={item.title}
              ref={globalIndex === selectedIndex ? selectedRef : undefined}
              className={`slash-command-item${globalIndex === selectedIndex ? ' selected' : ''}`}
              onClick={() => command(item)}
              onMouseEnter={() => setSelectedIndex(globalIndex)}
              type="button"
            >
              <span className="slash-command-icon">{item.icon}</span>
              <span className="slash-command-text">
                <span className="slash-command-title">{item.title}</span>
                <span className="slash-command-description">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Render bridge: connects TipTap suggestion lifecycle to React
// ---------------------------------------------------------------------------

function createSuggestionRenderer() {
  let root: Root | null = null
  let container: HTMLDivElement | null = null
  const keyDownRef: KeyDownRef = { handler: null }

  return {
    onStart(props: SuggestionProps<SlashCommandItem, SlashCommandItem>) {
      container = document.createElement('div')
      container.className = 'slash-command-portal'
      document.body.appendChild(container)
      root = createRoot(container)

      root.render(
        <SlashCommandDropdown
          items={props.items}
          command={(item) => props.command(item)}
          clientRect={props.clientRect ?? null}
          keyDownRef={keyDownRef}
        />,
      )
    },

    onUpdate(props: SuggestionProps<SlashCommandItem, SlashCommandItem>) {
      if (!root) return

      root.render(
        <SlashCommandDropdown
          items={props.items}
          command={(item) => props.command(item)}
          clientRect={props.clientRect ?? null}
          keyDownRef={keyDownRef}
        />,
      )
    },

    onKeyDown(props: SuggestionKeyDownProps): boolean {
      if (props.event.key === 'Escape') {
        return true
      }

      if (keyDownRef.handler) {
        return keyDownRef.handler(props.event)
      }
      return false
    },

    onExit() {
      const r = root
      const c = container
      root = null
      container = null
      keyDownRef.handler = null

      requestAnimationFrame(() => {
        r?.unmount()
        c?.remove()
      })
    },
  }
}

// ---------------------------------------------------------------------------
// TipTap Extension
// ---------------------------------------------------------------------------

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase()
          if (!q) return SLASH_COMMANDS
          return SLASH_COMMANDS.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.group.toLowerCase().includes(q),
          )
        },
        render: createSuggestionRenderer,
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: SlashCommandItem
        }) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})
