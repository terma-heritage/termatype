# TermaType

**Beautiful bilingual writing. Free forever.**

TermaType is a free, open-source, offline-first word processor designed for bilingual English-Tibetan writing. Built with Tauri 2, React, and TipTap 3.

## Features

### Editor
- Rich text editing (headings, bold, italic, lists, blockquotes, tables, code blocks)
- DOCX and plain text file support with native file dialogs
- Auto-save (30-second interval when file has a path)
- PDF export via html2pdf
- Zoom in/out (Ctrl++/-, Ctrl+0 to reset) with proper content reflow
- Focus mode (Ctrl+\\) — fades UI chrome, dims non-active paragraphs
- Typewriter scrolling — keeps cursor vertically centered
- Word count, character count, and reading time estimate in status bar
- Print support (Ctrl+P)
- Light and dark themes

### Tibetan Input (EWTS)
- Full EWTS 2.0 (Extended Wylie Transliteration Scheme) compliant input
- Real-time Wylie-to-Tibetan Unicode conversion as you type
- Toggle between English and Tibetan with Ctrl+Space or click the status bar indicator
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
- Offline Tibetan-English dictionary lookup
- In-memory caching for fast repeated queries
- Installable as a plugin (~5 MB)

### Tools Panel
- Tabbed sidebar: Assistant, Dictionary, EWTS Reference
- Full EWTS reference documentation with consonant/vowel grids, stacking rules, punctuation table
- Keyboard shortcuts panel (Ctrl+/)

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.77+
- [Tauri CLI](https://tauri.app/start/): `cargo install tauri-cli --version "^2"`

### Setup

```bash
cd termatype
npm install
cargo tauri dev
```

### Build

```bash
cargo tauri build
```

### Architecture

- **Frontend**: React + TipTap 3 + ProseMirror plugins
- **Backend**: Tauri 2 (Rust) for file I/O, plugin management, and AI inference
- **AI**: llama.cpp via llama-cpp-2 Rust bindings (Gemma 3 1B Q4_K_M)
- **IME**: Custom stateful Wylie engine with multi-character lookahead

## License

MIT
