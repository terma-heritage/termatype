# TermaType

**Beautiful bilingual writing. Free forever.**

TermaType is a free, open-source, offline-first word processor designed for bilingual English-Tibetan writing. Built with Tauri 2, React, and TipTap 3.

## Features

### Editor
- Rich text editing (headings, bold, italic, underline, strikethrough, lists, blockquotes, tables, code blocks, images, footnotes, page breaks)
- Font family and font size selection
- Text color and highlight color
- Text alignment (left, center, right, justify)
- Indent and outdent (Tab / Shift+Tab)
- Line spacing control (1.0 to 3.0)
- DOCX and plain text file support with native file dialogs
- Auto-save (30-second interval when file has a path)
- Document templates (Blank, Tibetan Prayer, Translation Project, Glossary, Essay)
- Find and replace (Ctrl+F / Ctrl+H)
- Version history with snapshot restore
- Special characters insertion grid

### Export
- PDF export via html2pdf
- EPUB export with automatic chapter splitting at H1/H2 headings
- Print support (Ctrl+P)

### Writing Modes
- Focus mode (Ctrl+\\) — fades UI chrome, dims non-active paragraphs
- Reading mode — hides all toolbars for distraction-free reading
- Typewriter scrolling — keeps cursor vertically centered
- Zoom in/out (Ctrl++/-, Ctrl+0 to reset) with content reflow
- Light and dark themes

### Status Bar
- Word count, character count, reading time, and page estimate
- Click for detailed statistics (sentences, paragraphs, Tibetan syllables, characters without spaces)
- Save status indicator with auto-save error reporting
- Language toggle (EN / བོད)

### Tibetan Input (EWTS)
- Full EWTS 2.0 (Extended Wylie Transliteration Scheme) compliant input
- Real-time Wylie-to-Tibetan Unicode conversion as you type
- Toggle between English and Tibetan with Ctrl+Space
- Automatic consonant stacking, vowel placement, and syllable validation
- Sanskrit extensions (retroflex, sibilants, bindu, visarga, anusvara)
- On-screen EWTS keyboard reference
- Inline buffer preview showing pending Wylie input

### Terma Assistant (Local AI)
- Grammar fix, rewrite, and enhance modes powered by Gemma 3 1B
- Runs 100% locally — text never leaves the device
- Installable as a plugin (~800 MB model download)
- Non-blocking inference — UI stays responsive during processing

### Tibetan Dictionary
- Offline Tibetan-English dictionary with 239,000+ entries
- Sources: Rangjung Yeshe and Monlam dictionaries
- SQLite-backed with three-tier search (exact, prefix, full-text)
- Installable as a plugin (~48 MB)

### Tools Panel
- Tabbed sidebar: Assistant, Dictionary, Wylie Reference, Document Outline
- Document outline with click-to-navigate heading list
- Full EWTS reference with consonant/vowel grids, stacking rules, punctuation table
- Keyboard shortcuts panel (Ctrl+/)

### Desktop
- Native splash screen during app startup
- Drag and drop file opening
- Native save/open dialogs
- Unsaved changes warning on close

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.77+
- [Tauri CLI](https://tauri.app/start/): `cargo install tauri-cli --version "^2"`

### Setup

```bash
npm install
cargo tauri dev
```

### Build

```bash
cargo tauri build
```

### Architecture

- **Frontend**: React 19 + TipTap 3 + ProseMirror extensions
- **Backend**: Tauri 2 (Rust) for file I/O, plugin management, and AI inference
- **AI**: llama.cpp via llama-cpp-2 Rust bindings (Gemma 3 1B Q4_K_M)
- **IME**: Custom stateful Wylie engine with multi-character lookahead
- **Dictionary**: SQLite via rusqlite with bundled build

## License

MIT
