<p align="center">
  <em>This software is offered freely for the benefit of all beings.<br>
  May it help preserve and share the Tibetan language for generations to come.</em>
</p>

<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="100" alt="TermaType icon" />
</p>

<h1 align="center">TermaType</h1>

<p align="center">
  <strong>གཏེར་མ་ཡིག་སྦྱོར།</strong><br>
  The first word processor built for English and Tibetan.<br>
  Free. Open source. 100% offline.
</p>

<!-- UPDATE THESE LINKS WHEN RELEASING A NEW VERSION -->
<p align="center">
  <a href="https://github.com/terma-heritage/termatype/releases/download/v1.0.2/TermaType_1.0.2_x64-setup.exe">
    <img src="https://img.shields.io/badge/Download_for_Windows-v1.0.2-E8784A?style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows" />
  </a>
  &nbsp;
  <a href="https://github.com/terma-heritage/termatype/releases/download/v1.0.2/TermaType_1.0.2_aarch64.dmg">
    <img src="https://img.shields.io/badge/Download_for_Mac_(Apple_Silicon)-v1.0.2-E8784A?style=for-the-badge&logo=apple&logoColor=white" alt="Download for Mac (Apple Silicon)" />
  </a>
  &nbsp;
  <a href="https://github.com/terma-heritage/termatype/releases/download/v1.0.2/TermaType_1.0.2_x64.dmg">
    <img src="https://img.shields.io/badge/Download_for_Mac_(Intel)-v1.0.2-E8784A?style=for-the-badge&logo=apple&logoColor=white" alt="Download for Mac (Intel)" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/terma-heritage/termatype/blob/main/LICENSE"><img src="https://img.shields.io/github/license/terma-heritage/termatype?style=flat-square" alt="License" /></a>
  <a href="https://github.com/terma-heritage/termatype/releases"><img src="https://img.shields.io/github/v/release/terma-heritage/termatype?style=flat-square&color=E8784A" alt="Release" /></a>
  <a href="https://github.com/terma-heritage/termatype/releases"><img src="https://img.shields.io/github/downloads/terma-heritage/termatype/total?style=flat-square&color=E8784A" alt="Downloads" /></a>
  <a href="https://github.com/terma-heritage/termatype/commits/main"><img src="https://img.shields.io/github/last-commit/terma-heritage/termatype?style=flat-square" alt="Last Commit" /></a>
  <img src="https://img.shields.io/badge/platform-Windows%20|%20macOS-blue?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/offline-100%25-green?style=flat-square" alt="Offline" />
</p>

---

<!-- 
  TODO: Add a hero screenshot here. Take a screenshot of the app with some 
  Tibetan + English text, save as screenshots/hero.png, and uncomment:
  
  <p align="center">
    <img src="screenshots/hero.png" width="800" alt="TermaType — bilingual English-Tibetan writing" />
  </p>
-->

## Why TermaType?

Most word processors treat Tibetan as an afterthought. TermaType was built from the ground up for bilingual writing — with proper Tibetan input, an offline dictionary, and AI tools that understand both languages.

- **Just type Wylie, get Tibetan.** Full EWTS input with real-time conversion. Toggle with `Ctrl+Space`.
- **Look up any word instantly.** 239,000+ entry Tibetan-English dictionary built into the sidebar.
- **AI that stays on your machine.** Grammar fixes, rewrites, translations — all running locally. No cloud. No accounts.
- **Export anywhere.** Save as DOCX, PDF, or EPUB. Print-ready with footnotes and page breaks.

---

## What's Inside

### Write in both languages, seamlessly

Type English normally. Hit `Ctrl+Space` and type Wylie — it converts to Tibetan Unicode in real time. Consonant stacking, vowel placement, and Sanskrit extensions all handled automatically. An on-screen keyboard shows every EWTS mapping.

### A real word processor

Everything you'd expect: headings, lists, tables, images with alignment and resizing, code blocks, footnotes, format painter, find & replace. Multiple document tabs with auto-save. Dark mode. Focus mode that fades everything but your current paragraph.

### Dictionary at your fingertips

Select any Tibetan word and look it up instantly in the sidebar. 239,000+ entries from the Rangjung Yeshe and Monlam dictionaries. Works offline — no internet needed.

### AI writing assistant

Highlight text and ask the AI to fix grammar, rewrite for clarity, summarize, or expand. Powered by Gemma 3 running entirely on your computer. Your text never leaves your device.

### Tibetan-English translation

Translate between Tibetan and English using the MITRA model (by Sebastian Nehrdich & Kurt Keutzer, Berkeley AI Research). Auto-detects direction. Runs offline for machines with 12+ GB RAM, with a dharmamitra.org fallback for lighter systems.

---

<!-- UPDATE THESE LINKS WHEN RELEASING A NEW VERSION -->
## Download

### Windows

**[Download TermaType for Windows](https://github.com/terma-heritage/termatype/releases/download/v1.0.2/TermaType_1.0.2_x64-setup.exe)**

Requires Windows 10 or later.

> **Windows SmartScreen:** Because TermaType is new and not yet code-signed, Windows may show a SmartScreen warning when you run the installer. Click **"More info"** → **"Run anyway"**. The app is fully open source — you can inspect every line of code in this repository.

### macOS

**[Download for Apple Silicon (M1/M2/M3/M4)](https://github.com/terma-heritage/termatype/releases/download/v1.0.2/TermaType_1.0.2_aarch64.dmg)** — for newer Macs (2020+)

**[Download for Intel](https://github.com/terma-heritage/termatype/releases/download/v1.0.2/TermaType_1.0.2_x64.dmg)** — for older Macs

Requires macOS 10.15 (Catalina) or later.

> **macOS Gatekeeper:** Because TermaType is not yet notarized with Apple, macOS will block the app the first time you open it. To allow it:
> 1. Open the `.dmg` and drag TermaType to your Applications folder.
> 2. Try to open TermaType — you'll see a warning that it "can't be opened."
> 3. Go to **System Settings → Privacy & Security**, scroll down, and click **"Open Anyway"** next to the TermaType message.
> 4. Click **"Open"** in the confirmation dialog. You only need to do this once.

---

## Optional Extensions

TermaType is tiny (7.8 MB) out of the box. Heavy features are optional plugins you install from **View → Extensions**:

| Extension | Size | What it does |
|-----------|------|-------------|
| **Terma Dictionary** | 48 MB | Offline Tibetan-English dictionary (Rangjung Yeshe + Monlam) |
| **Terma Assistant** | 806 MB | Local AI writing assistant (Gemma 3 1B) |
| **Terma Translator** | 5.9 GB | Offline Tibetan↔English translation (MITRA / Gemma 2 9B) |

Everything runs locally. No internet required after download. No accounts. No tracking.

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Toggle Tibetan/English | `Ctrl+Space` |
| Focus Mode | `Ctrl+\` |
| Find & Replace | `Ctrl+H` |
| Zoom In/Out | `Ctrl++` / `Ctrl+-` |
| Reset Zoom | `Ctrl+0` |
| Print | `Ctrl+P` |
| Slash Commands | Type `/` |

Full shortcuts reference available inside the app (`Ctrl+/`).

---

## Built With

- [Tauri 2](https://tauri.app/) — native desktop shell
- [React 19](https://react.dev/) + [TipTap 3](https://tiptap.dev/) — editor framework
- [llama.cpp](https://github.com/ggml-org/llama.cpp) — local AI inference
- [MITRA](https://github.com/buddhist-nlp/mitra) — Tibetan-English translation model
- [Rangjung Yeshe](https://rywiki.tsadra.org/) + [Monlam](https://monlam.ai/) — dictionary data

---

## About

<p align="center">
  <em>This software is offered freely for the benefit of all beings.<br>
  May it help preserve and share the Tibetan language for generations to come.</em>
</p>

<p align="center">
  Built by <strong>Terma Heritage Foundation, Inc.</strong><br>
  Lead developer: <strong>Thupten Chakrishar</strong><br><br>
  <a href="https://termafoundation.org/">termafoundation.org</a>
</p>

## License

GPL v3 — free to use, modify, and distribute.
