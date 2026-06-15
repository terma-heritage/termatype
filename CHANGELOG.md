# Changelog

All notable changes to TermaType are recorded here. Dates are when the work
landed on `main`, not necessarily when a store build shipped.

## [Unreleased]

### Tibetan input

- **Two input methods with a toggle.** Added the **TCRC (Bodyig)** positional
  keyboard alongside **Wylie**. Both implement one shared `InputEngine`
  contract; the editor picks the active one per keystroke. The choice is set in
  Settings and remembered across sessions (default Wylie on first launch).
- **Wylie now uses the proven EWTS library** (`tibetan-ewts-converter`) instead
  of a hand-rolled converter — fixes previously untypeable stacks and the HŪṂ
  seed syllable (`hU~M`). The old `wylie-map.ts` was removed.
- **TCRC engine** transcribed from the official TCRC chart (`tcrc-map.ts`),
  validated against the chart's own examples (`kya`, `bka'`, `bskyod`). A few
  Sanskrit/rare keys are flagged for confirmation.

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
- **Alignment** collapsed from four toolbar buttons into one dropdown (shared
  with the selection bubble menu).
- **Help:** added **TCRC Reference** next to **Wylie Reference** (generated from
  the keymap so it can't drift).

### Fixes

- **PDF/EPUB export on macOS:** write through a native Rust command instead of
  the JS fs plugin, fixing exports that silently produced no file; errors are
  now surfaced instead of an invisible fallback.
- **Selection/table/image bubble menus** no longer mis-anchor to the top-left
  (caused by the editor's CSS `zoom`); they use a fixed Floating-UI strategy
  appended to the body.

## [2.0.1]

- Baseline prior to the input/UX overhaul.
