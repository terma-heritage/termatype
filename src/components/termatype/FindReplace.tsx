import { useState, useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Node as PmNode } from '@tiptap/pm/model'

const findReplacePluginKey = new PluginKey('findReplace')

interface FindState {
  searchTerm: string
  matchCase: boolean
  results: { from: number; to: number }[]
  currentIndex: number
}

function findMatches(
  doc: PmNode,
  searchTerm: string,
  matchCase: boolean
): { from: number; to: number }[] {
  if (!searchTerm) return []

  const results: { from: number; to: number }[] = []
  const term = matchCase ? searchTerm : searchTerm.toLowerCase()

  doc.descendants((node: PmNode, pos: number) => {
    if (!node.isText || !node.text) return
    const text = matchCase ? node.text : node.text.toLowerCase()
    let index = text.indexOf(term)
    while (index !== -1) {
      results.push({ from: pos + index, to: pos + index + searchTerm.length })
      index = text.indexOf(term, index + 1)
    }
  })

  return results
}

export const FindReplaceExtension = Extension.create({
  name: 'findReplace',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: findReplacePluginKey,
        state: {
          init(): FindState {
            return { searchTerm: '', matchCase: false, results: [], currentIndex: -1 }
          },
          apply(tr, prev): FindState {
            const meta = tr.getMeta(findReplacePluginKey)
            if (meta) return meta
            if (tr.docChanged && prev.searchTerm) {
              const results = findMatches(tr.doc, prev.searchTerm, prev.matchCase)
              const currentIndex = results.length > 0
                ? Math.min(prev.currentIndex, results.length - 1)
                : -1
              return { ...prev, results, currentIndex }
            }
            return prev
          },
        },
        props: {
          decorations(state) {
            const pluginState = findReplacePluginKey.getState(state) as FindState
            if (!pluginState || !pluginState.searchTerm || pluginState.results.length === 0) {
              return DecorationSet.empty
            }

            const decorations = pluginState.results.map((result, i) => {
              const className = i === pluginState.currentIndex
                ? 'find-highlight find-highlight-current'
                : 'find-highlight'
              return Decoration.inline(result.from, result.to, { class: className })
            })

            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  },
})

function dispatchFindState(editor: Editor, state: FindState) {
  editor.view.dispatch(
    editor.view.state.tr.setMeta(findReplacePluginKey, state)
  )
}

export function FindReplace({
  editor,
  onClose,
}: {
  editor: Editor
  onClose: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const getState = useCallback((): FindState => {
    return findReplacePluginKey.getState(editor.state) as FindState
  }, [editor])

  const updateSearch = useCallback(
    (term: string, caseSensitive: boolean) => {
      const results = findMatches(editor.state.doc, term, caseSensitive)
      const currentIndex = results.length > 0 ? 0 : -1
      dispatchFindState(editor, {
        searchTerm: term,
        matchCase: caseSensitive,
        results,
        currentIndex,
      })
      if (results.length > 0) {
        scrollToMatch(results[0])
      }
    },
    [editor]
  )

  const scrollToMatch = useCallback(
    (match: { from: number; to: number }) => {
      editor.chain().setTextSelection(match).run()
      const domAtPos = editor.view.domAtPos(match.from)
      const node = domAtPos.node instanceof Element ? domAtPos.node : domAtPos.node.parentElement
      node?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    },
    [editor]
  )

  const goToNext = useCallback(() => {
    const state = getState()
    if (state.results.length === 0) return
    const next = (state.currentIndex + 1) % state.results.length
    dispatchFindState(editor, { ...state, currentIndex: next })
    scrollToMatch(state.results[next])
  }, [editor, getState, scrollToMatch])

  const goToPrev = useCallback(() => {
    const state = getState()
    if (state.results.length === 0) return
    const prev = (state.currentIndex - 1 + state.results.length) % state.results.length
    dispatchFindState(editor, { ...state, currentIndex: prev })
    scrollToMatch(state.results[prev])
  }, [editor, getState, scrollToMatch])

  const replaceOne = useCallback(() => {
    const state = getState()
    if (state.currentIndex < 0 || state.results.length === 0) return
    const match = state.results[state.currentIndex]
    editor.chain().focus().setTextSelection(match).insertContent(replaceTerm).run()
  }, [editor, getState, replaceTerm])

  const replaceAll = useCallback(() => {
    const state = getState()
    if (state.results.length === 0) return
    const { tr } = editor.view.state
    for (let i = state.results.length - 1; i >= 0; i--) {
      const match = state.results[i]
      if (replaceTerm) {
        tr.replaceWith(match.from, match.to, editor.schema.text(replaceTerm))
      } else {
        tr.delete(match.from, match.to)
      }
    }
    editor.view.dispatch(tr)
  }, [editor, getState, replaceTerm])

  const handleClose = useCallback(() => {
    dispatchFindState(editor, {
      searchTerm: '',
      matchCase: false,
      results: [],
      currentIndex: -1,
    })
    onClose()
    editor.commands.focus()
  }, [editor, onClose])

  useEffect(() => {
    searchRef.current?.focus()
    searchRef.current?.select()
  }, [])

  useEffect(() => {
    updateSearch(searchTerm, matchCase)
  }, [searchTerm, matchCase, updateSearch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        goToNext()
      }
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        goToPrev()
      }
    }
    const el = searchRef.current?.closest('.find-replace-panel')
    el?.addEventListener('keydown', handler as EventListener)
    return () => el?.removeEventListener('keydown', handler as EventListener)
  }, [handleClose, goToNext, goToPrev])

  const state = getState()
  const count = state?.results.length ?? 0
  const current = count > 0 ? (state?.currentIndex ?? -1) + 1 : 0

  return (
    <div className="find-replace-panel">
      <div className="find-replace-row">
        <div className="find-replace-input-group">
          <input
            ref={searchRef}
            type="text"
            className="find-replace-input"
            placeholder="Find..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="find-replace-count">
            {searchTerm ? `${current} of ${count}` : ''}
          </span>
        </div>
        <button
          className={`find-replace-btn find-replace-case ${matchCase ? 'active' : ''}`}
          onClick={() => setMatchCase(!matchCase)}
          title="Match case"
        >
          Aa
        </button>
        <button className="find-replace-btn" onClick={goToPrev} disabled={count === 0} title="Previous (Shift+Enter)">
          ▲
        </button>
        <button className="find-replace-btn" onClick={goToNext} disabled={count === 0} title="Next (Enter)">
          ▼
        </button>
        <button
          className={`find-replace-btn find-replace-expand ${showReplace ? 'active' : ''}`}
          onClick={() => setShowReplace(!showReplace)}
          title="Toggle Replace"
        >
          ⇄
        </button>
        <button className="find-replace-btn find-replace-close" onClick={handleClose} title="Close (Esc)">
          ✕
        </button>
      </div>

      {showReplace && (
        <div className="find-replace-row">
          <input
            type="text"
            className="find-replace-input find-replace-input-full"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
          />
          <button className="find-replace-btn" onClick={replaceOne} disabled={count === 0} title="Replace">
            Replace
          </button>
          <button className="find-replace-btn" onClick={replaceAll} disabled={count === 0} title="Replace all">
            All
          </button>
        </div>
      )}
    </div>
  )
}
