# Tibetan IME (Wylie + TCRC)

Tibetan input for the TermaType editor, with **two interchangeable methods** the
user toggles between:

- **Wylie / EWTS** — transliteration; preferred by Western scholars.
- **TCRC (Bodyig)** — the positional keyboard standard used by the CTA / Tibetan
  exile community.

Self-contained and portable — the engines have no framework dependencies (only
the TipTap binding does), so this folder can be copied into other projects.

## What it does

- **Wylie:** type with a normal keyboard using the **Extended Wylie
  Transliteration Scheme (EWTS)** — e.g. `bskyod` → `བསྐྱོད`, `hU~M` → `ཧཱུྃ`.
- **TCRC:** a fixed key→glyph layout (e.g. `k`→ཀ, `f`→ང) with a halant dead-key
  (`a`) that subjoins the next consonant — e.g. `b s a k a y o d` → `བསྐྱོད`.

Both engines implement the same `InputEngine` contract
(`feed/flush/reset/backspace → {committed, buffer, consumed}`), so the editor
binding swaps between them via a `getInputMethod()` getter.

## Library

All Wylie ↔ Tibetan conversion is delegated to
[`tibetan-ewts-converter`](https://github.com/rogerespel/ewts-js) (ewts-js) — the
reference EWTS implementation by Roger Espel Llima, author of the original
Wylie/EWTS converter. Apache-2.0, pure ESM, zero dependencies.

We do **not** hand-maintain a Wylie mapping table. That was the previous
approach and it missed characters (HŪṂ, head marks, many stacks). Delegating to
the reference library fixes whole classes of input at once.

## Files

| File | Role | Framework-coupled? |
|------|------|--------------------|
| `input-engine.ts` | The shared `InputEngine` contract + `TibetanInputMethod` type. | No |
| `ewts.ts` | Shared Wylie converter singleton + `wylieToUnicode()`. | No |
| `wylie-engine.ts` | `WylieEngine` — Wylie IME adapter (buffer + commit timing). | No |
| `tcrc-map.ts` | The TCRC Bodyig keymap (key→glyph), transcribed from the official chart. | No |
| `tcrc-engine.ts` | `TcrcEngine` — positional engine (halant dead-key, tsheg/shad rules). | No |
| `tibetan-marks.ts` | Data for the special-character palette (honorific / terma / auspicious marks). | No |
| `tibetan-ime-extension.ts` | TipTap/ProseMirror plugin; picks the engine via `getInputMethod()`. | **Yes (TipTap)** |
| `tibetan-ewts-converter.d.ts` | Type shim for the untyped Wylie package. | No |
| `index.ts` | Public barrel export. | — |

## TCRC keymap status

`tcrc-map.ts` is transcribed from TCRC's official chart. The core (consonants,
vowels, halant, yatag/ratag, tsheg, shad, digits) is verified against the
chart's worked examples (`kya`, `bka'`, `bskyod`). Entries flagged `verify: true`
(some Sanskrit aspirates and rarer marks) are best-effort reads that should be
confirmed on a real TCRC keyboard — each is a one-line data fix.

Phase 2 (not yet built): a TCRC on-screen keyboard view, and the polished
method-switching UX. Today the on-screen keyboard always shows the Wylie layout.

## Public API

```ts
import { wylieToUnicode, WylieEngine, createTibetanIMEExtension } from './tibetan-ime'

// One-shot batch conversion (find/replace, practice page, etc.)
wylieToUnicode('sangs rgyas')          // → 'སངས་རྒྱས'

// Incremental IME, framework-agnostic. feed/flush/reset → { committed, buffer, consumed }
const engine = new WylieEngine()
engine.feed('k'); engine.feed('a'); engine.feed(' ')   // commits 'ཀ་'
```

### `WylieEngine` contract

- `feed(char)` — extend the current syllable. A space ends the syllable and
  converts it (the space becomes a tsheg). Returns `committed` (text to insert)
  and `buffer` (raw Wylie preedit to display).
- `backspace()` — remove one character from the preedit.
- `flush()` — commit whatever is pending (no trailing tsheg) on Enter, blur,
  language switch, etc.
- `reset()` — discard pending state.

## Reusing in another project

Tibetan input needs **two** independent pieces. Both must be ported:

1. **The EWTS converter** — covers the alphabet, stacks, vowels, and the common
   punctuation/head marks. Copy this folder and `npm install
   tibetan-ewts-converter`, then use `wylieToUnicode` / `WylieEngine`. Only
   `tibetan-ime-extension.ts` is TipTap-specific — replace it with a binding for
   your editor while keeping the same `feed/flush/reset` contract.
2. **The special-character palette** — covers everything EWTS *cannot* type
   (see below). Import `TIBETAN_MARK_GROUPS` from `tibetan-marks.ts` and wire each
   `mark.char` into the host app's "insert character" action. The data is
   framework-agnostic; only the rendering/insert call is app-specific.

### What EWTS cannot type (and why the palette is mandatory)

The EWTS / Wylie standard defines **no keystrokes** for honorific head marks,
terma (gter / brda-rnying) ornaments, or auspicious symbols. This is a gap in
the *standard itself* — no converter (ewts-js, ewts-rs, BDRC, …) can type them.
Examples that come up constantly:

| Mark | Name | How to insert |
|------|------|---------------|
| ༸ | che mgo — honorific before HH the Dalai Lama (༸གོང་ས་མཆོག) | palette only |
| ༁ ༂ ༃ | gter yig mgo (terma head marks) | palette only |
| ࿓ ࿔ | brda rnying yig mgo | palette only |
| ༀ | precomposed Om (`oM` gives the *decomposed* ཨོཾ) | palette only |
| ཧཱུྃ | HŪṂ seed syllable | typeable: `hU~M` |

In `tibetan-marks.ts`, every entry has a `wylie` field: a string means it is
typeable in Wylie, `null` means it is palette-only. That field is the exact
checklist of what the palette must cover.

## EWTS quick reference

| Type | Get | | Type | Get |
|------|-----|-|------|-----|
| space | ་ (tsheg) | | `/` `//` | ། ༎ (shad) |
| `@` `#` | ༄ ༅ (yig mgo) | | `;` `\|` `:` | ༏ ༑ ༔ |
| `hU~M` | ཧཱུྃ | | `oM` | ཨོཾ |
| `bskyod` | བསྐྱོད | | `k+Sha` | ཀྵ |

Rare ornaments (swastika ࿇, bsdus-rtags ࿄, U+0FBE–U+0FCF, precomposed ༀ) have
no EWTS keystroke in the standard; insert them via a character picker.
