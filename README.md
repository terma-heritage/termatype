# TermaType

**གཏེར་མ་ཡིག་སྦྱོར། Beautiful bilingual writing. Free forever.**

TermaType is a free, open-source, offline-first word processor designed for bilingual English-Tibetan writing. Built with Tauri 2, React, and TipTap 3.

Built by **Thupten Chakrishar** at **[Terma Heritage Foundation, Inc.](https://termafoundation.org/)**

---

## Download

| Platform | Download | Requirements |
|----------|----------|-------------|
| Windows  | [**TermaType_1.0.0_x64-setup.exe**](https://github.com/vajradog/termatype-app/releases/download/v1.0.0/TermaType_1.0.0_x64-setup.exe) (7.8 MB) | Windows 10 or later |
| macOS    | Coming soon | — |

> **Note:** Windows may show a SmartScreen warning because the app is new and not yet code-signed with an EV certificate. Click **"More info"** then **"Run anyway"** to proceed. The app is fully open-source — you can inspect every line of code in this repository.

## Optional Extensions

TermaType is lightweight (7.8 MB) by default. Install optional extensions from **View → Extensions** inside the app:

| Extension | Size | Description |
|-----------|------|-------------|
| Terma Dictionary | 48 MB | Offline Tibetan-English dictionary with 239,000+ entries (Rangjung Yeshe + Monlam) |
| Terma Assistant | 806 MB | Local AI writing assistant — grammar fix, rewrite, summarize, expand (Gemma 3 1B) |
| Terma Translator | 5.9 GB | Offline Tibetan↔English translation (MITRA model, requires 12+ GB RAM) |

All extensions run 100% locally. No internet required after download.

---

## Features

### Rich Text Editor
- Headings, bold, italic, underline, strikethrough, highlight, superscript, subscript
- Bullet lists, numbered lists, and task lists with checkboxes
- Resizable tables, blockquotes, and syntax-highlighted code blocks
- Images with alignment (left, center, right, float), resize, and alt text editing
- Font family, font size, text color, text alignment, line height, and indentation
- Footnotes and page breaks for print-ready documents
- Slash commands — type `/` to quickly insert any block type
- Format Painter — copy formatting from one selection and apply to another
- DOCX, TXT, and Markdown file support with native file dialogs

### Tibetan Input (EWTS)
- Full EWTS 2.0 (Extended Wylie Transliteration Scheme) compliant input
- Real-time Wylie-to-Tibetan Unicode conversion as you type
- Toggle between English and Tibetan with `Ctrl+Space`
- Automatic consonant stacking, vowel placement, and syllable validation
- Sanskrit extensions (retroflex, sibilants, bindu, visarga, anusvara)
- On-screen EWTS keyboard reference with interactive practice page
- Inline buffer preview showing pending Wylie input

### Tibetan Language Tools
- **Tibetan Dictionary** — offline Tibetan-English dictionary sidebar
- **Wylie-aware Find & Replace** — search using Wylie transliteration to find matching Tibetan text (`Ctrl+H`, toggle "Wy" button)
- **Translation** — translate between Tibetan and English using the MITRA model offline, or via dharmamitra.org

### AI Writing Assistant
- Grammar fix, rewrite, summarize, expand, and translate
- Runs 100% locally — text never leaves your device
- Non-blocking inference — UI stays responsive during processing

### Writing Modes
- **Focus Mode** (`Ctrl+\`) — fades UI chrome, dims non-active paragraphs
- **Typewriter Mode** — keeps the current line centered on screen
- **Reading Mode** — hides all toolbars for distraction-free reading
- **Zoom** — 50% to 200% with content reflow (`Ctrl++/-`, `Ctrl+0` to reset)
- Light and dark themes

### Document Management
- Multi-tab document editing with browser-style tabs
- Auto-save (30-second interval when file has a path)
- Auto-naming from first heading or paragraph
- Unsaved changes dialog (Save / Don't Save / Cancel)
- Drag and drop file opening

### Print & Export
- Print with native system dialog (`Ctrl+P`)
- PDF export with beautiful formatting
- EPUB export with automatic chapter splitting at H1/H2 headings

### Privacy
- 100% local — documents, dictionary, AI, and translations all run on your computer
- No cloud, no accounts, no tracking, no telemetry

---

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
- **AI Assistant**: llama.cpp via llama-cpp-2 Rust bindings (Gemma 3 1B Q4_K_M)
- **Translator**: llama.cpp via llama-cpp-2 Rust bindings (MITRA / Gemma 2 9B Q4_K_M)
- **IME**: Custom stateful Wylie engine with multi-character lookahead
- **Dictionary**: SQLite via rusqlite with bundled build (Rangjung Yeshe + Monlam)

---

## About

**Terma Heritage Foundation, Inc.**

*To preserve, promote, and advance Himalayan and Tibetan cultural heritage, including language preservation and revitalization, through technology, education, arts, and community programs — for the benefit of Tibetan, Himalayan, and broader communities worldwide.*

[termafoundation.org](https://termafoundation.org/)

## License

MIT
