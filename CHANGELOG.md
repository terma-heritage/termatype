# Changelog

All notable changes to TermaType are recorded here. Dates are when the work
landed on `main`, not necessarily when a store build shipped.

## [2.1.1] — 2026-06-23

### Acknowledgments

- **TCRC keyboard layout credited with permission.** The TCRC (Bodyig) keyboard
  layout is now formally acknowledged — in the README, on the in-app About page
  (English and Tibetan), and in the keymap source — as being used with the kind
  permission of the Tibetan Computer Resource Center (TCRC), Central Tibetan
  Administration.

### Fixes

- **Dictionary now works in the App Store / Microsoft Store builds.** The bundled
  dictionary database shipped in SQLite WAL mode, which cannot be opened from the
  read-only resource directory of a sandboxed store install (it needs to create
  `-wal`/`-shm` side-files) — so every lookup returned "No results found" for
  Store users, while the GitHub `.msi`/`.dmg` builds were unaffected. The database
  is now shipped in DELETE (rollback) journal mode and opened with the SQLite
  `immutable=1` flag, so it reads cleanly from read-only media. Affects both
  Windows (MSIX) and macOS (App Store) builds.

## [2.1.0] — 2026-06-15

### Tibetan input

- **Two input methods with a toggle.** Added the **TCRC (Bodyig)** positional
  keyboard alongside **Wylie**. Both implement one shared `InputEngine`
  contract; the editor picks the active one per keystroke. The choice is set in
  Settings and remembered across sessions (default Wylie on first launch).
- **Wylie now uses the proven EWTS library** (`tibetan-ewts-converter`) instead
  of a hand-rolled converter — fixes previously untypeable stacks and the HŪṂ
  seed syllable (`hU~M`). The old `wylie-map.ts` was removed.
- **TCRC engine** transcribed from the official TCRC chart (`tcrc-map.ts`),
  validated against the chart's worked examples (`kya`, `bka'`, `bskyod`) and
  cross-checked against the TCRC Bodyig reference implementation — consonants,
  vowels, halant stacking, and marks all confirmed.

### Special characters

- Added a curated palette of **honorific / terma / auspicious marks** that
  EWTS and TCRC cannot type (e.g. ༸ che-mgo, ༁ ༂ ༃, ࿓ ࿔, ༀ), in
  **Insert ▸ Special Characters** and the reference pages.

### Interface (simplification pass)

- **Typing-mode indicator:** caret colour by language (terracotta = Tibetan,
  blue = English), a tappable language chip on the page (shows `· Wylie` /
  `· TCRC`), and a brief HUD on switch.
- **Settings screen** (gear, top-right): *App language* and *Typing method
  (Wylie/TCRC)* — set-once choices moved out of the chrome.
- **Removed the floating on-screen keyboard** (Wylie-only and redundant) and the
  floating outline/dictionary buttons (still in the View menu); **slimmed the
  status bar**.
- **Toolbar** trimmed: alignment collapsed from four buttons into one dropdown
  (shared with the selection bubble menu); Strikethrough/Code/Format-painter
  collapsed into a "More" (⋯) dropdown.
- **First-run welcome:** a single screen on first launch sets App language and
  Wylie/TCRC in place (reusing the Settings toggles).
- **Help consolidated** into one **Help & FAQ** hub (common questions + links to
  the Wylie/TCRC references, typing practice, and shortcuts); the Help menu is
  now just Help & FAQ + About. TCRC Reference added next to Wylie Reference,
  generated from the keymap so it can't drift.

### Fixes

- **Editor line spacing** is now a single value (1.9) for both languages, so
  switching between English and Tibetan no longer reflows the page.

- **PDF/EPUB export on macOS:** write through a native Rust command instead of
  the JS fs plugin, fixing exports that silently produced no file; errors are
  now surfaced instead of an invisible fallback.
- **Selection/table/image bubble menus** no longer mis-anchor to the top-left
  (caused by the editor's CSS `zoom`); they use a fixed Floating-UI strategy
  appended to the body.

## [2.0.1]

- Baseline prior to the input/UX overhaul.
