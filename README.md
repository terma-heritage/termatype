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
  <a href="https://apps.microsoft.com/detail/9nldclht1sz4">
    <img src="assets/badge-microsoft.svg" height="48" alt="Get TermaType on the Microsoft Store" />
  </a>
  &nbsp;
  <a href="https://apps.apple.com/us/app/termatype/id6776637186?mt=12">
    <img src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-mac-app-store/black/en-us" height="48" alt="Download TermaType on the Mac App Store" />
  </a>
  &nbsp;
  <a href="https://github.com/terma-heritage/termatype/releases/latest">
    <img src="assets/badge-linux.svg" height="48" alt="Download TermaType for Linux (AppImage)" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20|%20macOS%20|%20Linux-blue?style=flat-square" alt="Platform" />
</p>

<p align="center">
  <a href="https://github.com/terma-heritage/termatype/releases"><img src="https://img.shields.io/github/v/release/terma-heritage/termatype?style=flat-square&color=E8784A" alt="Release" /></a>
  <a href="https://github.com/terma-heritage/termatype/releases"><img src="https://img.shields.io/github/downloads/terma-heritage/termatype/total?style=flat-square&color=E8784A&label=GitHub%20Direct%20Downloads" alt="GitHub Direct Downloads" /></a>
  <img src="https://img.shields.io/badge/offline-100%25-green?style=flat-square" alt="Offline" />
</p>

<p align="center">
  <sub><em>Counts GitHub direct downloads only — Mac App Store and Microsoft Store installs are not included.</em></sub>
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

Most word processors treat Tibetan as an afterthought. TermaType was built from the ground up for bilingual writing — Tibetan first, not Tibetan as a plugin.

- **Just type Wylie, get Tibetan.** Full EWTS input with real-time conversion. Toggle with `Ctrl+Space`.
- **Dictionary woven into the page.** Hover or select any word for instant definitions. Click to insert Tibetan translations.
- **Truly bilingual UI.** Toggle the entire interface between English and Tibetan — menus, tabs, status bar, help pages, everything.
- **Beautiful Tibetan typography.** Tsheg-based line breaking, proper shay placement, OpenType stacking features, generous line height for vowel marks.
- **Export anywhere.** Save as DOCX, PDF, or EPUB with proper Tibetan margins and typography.
- **100% local.** No cloud. No accounts. No tracking. 14 MB download.

---

## What's Inside

### Write in both languages, seamlessly

Type English normally. Hit `Ctrl+Space` and type Wylie — it converts to Tibetan Unicode in real time. Consonant stacking, vowel placement, and Sanskrit extensions all handled automatically. An on-screen keyboard shows every EWTS mapping.

### A real word processor

Everything you'd expect: headings, lists, tables, images with alignment and resizing, code blocks, footnotes, format painter, find & replace. Multiple document tabs with auto-save. Dark mode. Focus mode that fades everything but your current paragraph.

### Dictionary woven into the page

Hover any Tibetan word for a quick definition. Select text for a richer popup with multiple results. Search English to find Tibetan equivalents and click to insert. A sidebar is available for deeper browsing. Bundled dictionary — works offline, always.

### Tibetan-first interface

Toggle the UI language switch and the entire app speaks Tibetan — every menu, every label, every help page. The window title, status bar, and document tabs all switch. Typing language stays independent — use `Ctrl+Space` to switch between English and Tibetan input.

### Beautiful typography

Proper line breaking so Tibetan text wraps at syllable boundaries, not randomly. OpenType features enabled for correct consonant stacking. Six curated Tibetan fonts bundled (including DDC Uchen for ornamental marks), plus access to all system fonts.

### Calm writing surface

Warm paper-like background, terracotta caret, gentle selection highlight. Focus mode hides everything — menus, tabs, sidebar — leaving only your words. Smooth transitions throughout. First launch: no setup, no login, just a blank page ready to write.

---

<!-- UPDATE THESE LINKS WHEN RELEASING A NEW VERSION -->
## Download

### Windows

**[Get TermaType on the Microsoft Store](https://apps.microsoft.com/detail/9nldclht1sz4)** — recommended

Installing from the Microsoft Store gives you automatic updates and no security warnings.

Requires Windows 10 or later.

#### Direct download (alternative)

Prefer a standalone installer? **[Download the installer (.exe)](https://github.com/terma-heritage/termatype/releases/latest)**

> **Windows SmartScreen:** The direct installer is new and not yet code-signed, so Windows may show a SmartScreen warning when you run it. Click **"More info"** → **"Run anyway"**. The app is fully open source — you can inspect every line of code in this repository. (Installing from the Microsoft Store avoids this warning.)

### macOS

**[Get TermaType on the Mac App Store](https://apps.apple.com/us/app/termatype/id6776637186?mt=12)** — recommended

Installing from the Mac App Store gives you automatic updates and the simplest setup.

Requires macOS 10.15 (Catalina) or later.

#### Direct download (alternative)

Prefer a standalone app? Download the `.dmg` directly:

**[Apple Silicon (M1/M2/M3/M4)](https://github.com/terma-heritage/termatype/releases/latest)** — for newer Macs (2020+)

**[Intel](https://github.com/terma-heritage/termatype/releases/latest)** — for older Macs

> TermaType is code-signed and notarized by Apple. Just open the `.dmg`, drag TermaType to your Applications folder, and launch it — no security warnings.

### Linux

**[Download AppImage](https://github.com/terma-heritage/termatype/releases/latest)** — runs on most distributions, no installation needed

After downloading, make it executable and run:

```sh
chmod +x TermaType_2.1.1_amd64.AppImage
./TermaType_2.1.1_amd64.AppImage
```

#### Package installs

- **Debian / Ubuntu:** **[Download .deb](https://github.com/terma-heritage/termatype/releases/latest)**, then `sudo apt install ./TermaType_2.1.1_amd64.deb`
- **Fedora / RHEL:** grab the `.rpm` from the **[releases page](https://github.com/terma-heritage/termatype/releases/latest)**, then `sudo dnf install ./TermaType-*.rpm`

> Built and tested on x86_64. The AppImage bundles its own dependencies; the `.deb` and `.rpm` pull in WebKitGTK (`libwebkit2gtk-4.1`) and GTK 3 from your distro.

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
- [Monlam](https://monlam.ai/) — dictionary data
- **TCRC Bodyig keyboard layout** — Tibetan input, used with permission (see Acknowledgments)

---

## Acknowledgments

The **TCRC (Bodyig) keyboard layout** in TermaType is based on the official
keyboard layout of the **Tibetan Computer Resource Center (TCRC)**, Department of
Finance, Central Tibetan Administration, and is included **with their kind
permission**. We are grateful to TCRC for supporting open, Tibetan-first software
and for their work preserving and promoting the Tibetan language through
technology.

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
