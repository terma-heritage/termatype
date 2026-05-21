import { useState, useCallback, useEffect, useRef } from 'react'
import { type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'

type ImageAlignment = 'left' | 'center' | 'right' | 'float-left' | 'float-right'

interface ImageSize {
  label: string
  width: number | null // null means original
}

const SIZES: ImageSize[] = [
  { label: '25%', width: 25 },
  { label: '50%', width: 50 },
  { label: '75%', width: 75 },
  { label: '100%', width: 100 },
  { label: 'Original', width: null },
]

function IconBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      className={`img-bubble-btn${active ? ' active' : ''}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

export function ImageBubbleMenu({ editor }: { editor: Editor }) {
  const [showAltInput, setShowAltInput] = useState(false)
  const [altText, setAltText] = useState('')
  const [showSizeMenu, setShowSizeMenu] = useState(false)
  const altInputRef = useRef<HTMLInputElement>(null)
  const sizeMenuRef = useRef<HTMLDivElement>(null)

  const getImageAttrs = useCallback(() => {
    const { selection } = editor.state
    const node = selection.node
    if (node?.type.name === 'image') {
      return node.attrs
    }
    return null
  }, [editor])

  const updateImageAttr = useCallback((attrs: Record<string, any>) => {
    const { selection } = editor.state
    if (selection.node?.type.name !== 'image') return
    const pos = (selection as any).$from?.pos ?? (selection as any).from
    const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
      ...selection.node.attrs,
      ...attrs,
    })
    editor.view.dispatch(tr)
  }, [editor])

  const currentAlignment = getImageAttrs()?.alignment || 'center'
  const currentSizePercent = getImageAttrs()?.widthPercent || null

  const setAlignment = useCallback((alignment: ImageAlignment) => {
    updateImageAttr({ alignment })
  }, [updateImageAttr])

  const setSizePercent = useCallback((percent: number | null) => {
    updateImageAttr({ widthPercent: percent })
    setShowSizeMenu(false)
  }, [updateImageAttr])

  const handleAltEdit = useCallback(() => {
    const attrs = getImageAttrs()
    setAltText(attrs?.alt || '')
    setShowAltInput(true)
    setTimeout(() => altInputRef.current?.focus(), 50)
  }, [getImageAttrs])

  const saveAlt = useCallback(() => {
    updateImageAttr({ alt: altText })
    setShowAltInput(false)
  }, [altText, updateImageAttr])

  const deleteImage = useCallback(() => {
    editor.chain().focus().deleteSelection().run()
  }, [editor])

  // Close size menu on outside click
  useEffect(() => {
    if (!showSizeMenu) return
    const handleClick = (e: MouseEvent) => {
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) {
        setShowSizeMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSizeMenu])

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top', offset: 8 }}
      shouldShow={({ state }) => {
        const { selection } = state
        const node = (selection as any).node
        return node?.type.name === 'image'
      }}
    >
      <div className="bubble-menu img-bubble-menu">
        {showAltInput ? (
          <div className="img-alt-input-row">
            <input
              ref={altInputRef}
              className="img-alt-input"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveAlt()
                if (e.key === 'Escape') setShowAltInput(false)
              }}
              placeholder="Describe this image..."
            />
            <button className="img-bubble-btn" onClick={saveAlt} title="Save">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button className="img-bubble-btn" onClick={() => setShowAltInput(false)} title="Cancel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            {/* Alignment buttons */}
            <IconBtn onClick={() => setAlignment('float-left')} active={currentAlignment === 'float-left'} title="Float left (text wraps)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <line x1="14" y1="5" x2="21" y2="5" />
                <line x1="14" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="3" y1="19" x2="21" y2="19" />
              </svg>
            </IconBtn>
            <IconBtn onClick={() => setAlignment('left')} active={currentAlignment === 'left'} title="Align left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="3" y2="18" />
                <rect x="6" y="8" width="10" height="8" rx="1" />
              </svg>
            </IconBtn>
            <IconBtn onClick={() => setAlignment('center')} active={currentAlignment === 'center'} title="Center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="8" width="14" height="8" rx="1" />
                <line x1="3" y1="4" x2="21" y2="4" />
                <line x1="3" y1="20" x2="21" y2="20" />
              </svg>
            </IconBtn>
            <IconBtn onClick={() => setAlignment('right')} active={currentAlignment === 'right'} title="Align right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="21" y1="6" x2="21" y2="18" />
                <rect x="8" y="8" width="10" height="8" rx="1" />
              </svg>
            </IconBtn>
            <IconBtn onClick={() => setAlignment('float-right')} active={currentAlignment === 'float-right'} title="Float right (text wraps)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="13" y="3" width="8" height="8" rx="1" />
                <line x1="3" y1="5" x2="10" y2="5" />
                <line x1="3" y1="9" x2="10" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="3" y1="19" x2="21" y2="19" />
              </svg>
            </IconBtn>

            <span className="bubble-sep" />

            {/* Size dropdown */}
            <div className="img-size-dropdown" ref={sizeMenuRef}>
              <button
                className="img-bubble-btn img-size-trigger"
                onClick={() => setShowSizeMenu(!showSizeMenu)}
                title="Resize image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                <span className="img-size-label">
                  {currentSizePercent ? `${currentSizePercent}%` : 'Size'}
                </span>
              </button>
              {showSizeMenu && (
                <div className="img-size-menu">
                  {SIZES.map((s) => (
                    <button
                      key={s.label}
                      className={`img-size-option${currentSizePercent === s.width ? ' active' : ''}`}
                      onClick={() => setSizePercent(s.width)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="bubble-sep" />

            {/* Alt text */}
            <IconBtn onClick={handleAltEdit} title="Edit alt text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span className="img-btn-label">Alt</span>
            </IconBtn>

            <span className="bubble-sep" />

            {/* Delete */}
            <IconBtn onClick={deleteImage} title="Delete image">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </IconBtn>
          </>
        )}
      </div>
    </BubbleMenu>
  )
}
