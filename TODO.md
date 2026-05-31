# TermaType Roadmap

**Vision:** The most beautiful, effortless place in the world to write Tibetan — and it's free.

---

## Phase 1: Strip & Simplify

- [x] Remove Terma Assistant (Gemma 3 / llama.cpp AI grammar feature)
- [x] Remove Terma Translator (MITRA / Gemma 2 translation feature)
- [x] Remove all llama.cpp Rust code and bindings
- [x] Remove the plugin/extension download and management system
- [x] Remove Rangjung Yeshe dictionary data
- [x] Rebuild dictionary with Monlam data only (~165,606 entries)
- [x] Label as "Tibetan-English Dictionary" in the app — no source attribution in UI
- [ ] Credit dictionary sources on website only, not in-app
- [ ] Plan: replace with own dictionary data in the future (Monlam is interim)
- [x] Bundle dictionary directly into the app (no separate plugin download)
- [x] Remove any publish-online / cloud features
- [x] Clean up UI — hide/remove Extensions menu, AI buttons, translation panel
- [ ] Target app size: under 60 MB total

---

## Phase 2: Inline Dictionary (the magic)

- [ ] Hover any Tibetan word to see definition in a tooltip
- [ ] Select a Tibetan word to see full dictionary entry inline
- [ ] Type an English word and see Tibetan suggestions
- [ ] Click-to-insert Tibetan from dictionary suggestions
- [ ] Keep sidebar as an option but make inline the default experience
- [ ] Dictionary should feel "woven into the page" not bolted on

---

## Phase 3: Beautiful Tibetan Typography

- [ ] Tsheg-based line breaking (break at tsheg, not space)
- [ ] Proper Tibetan justification
- [ ] Curate and bundle 3-5 beautiful Tibetan fonts
- [ ] Correct baselines so Tibetan and English sit well together
- [ ] Ensure proper shay placement
- [ ] Test with real Tibetan documents for typographic correctness

---

## Phase 4: Calm Writing Surface

- [ ] Visual polish — aim for iA Writer / Bear serenity meets pecha dignity
- [ ] Refine light mode (paper-light, warm)
- [ ] Refine dark mode (soft, not harsh)
- [ ] Polish focus mode (fade everything but current paragraph)
- [ ] Typography-forward design — Tibetan front and center
- [ ] Minimize chrome — fewer buttons, cleaner toolbar
- [ ] First-run experience: no setup, no login, just a blank page ready to write

---

## Phase 5: App Store Distribution

Goal: Be in every major app store. Stores handle signing, trust, and auto-updates — no expensive certificates needed.

- [ ] Mac App Store
  - [ ] Create "Mac App Distribution" certificate
  - [ ] Configure App Sandbox entitlements
  - [ ] Build .app/.pkg instead of .dmg for App Store
  - [ ] Create App Store Connect listing (screenshots, description, category)
  - [ ] Submit for review
- [ ] Microsoft Store
  - [ ] MSIX package (already partially configured)
  - [ ] Create Microsoft Store listing
  - [ ] Submit for review
  - [ ] (Avoids needing a $200-400/yr Windows code signing certificate)
- [ ] Linux — Flathub
  - [ ] Create Flatpak build config
  - [ ] Submit to Flathub (the main Linux app store)
  - [ ] Works on Ubuntu, Fedora, and all major distros
- [ ] Keep GitHub releases as alternative download for all platforms
- [ ] Auto-updating through store mechanisms

---

## Positioning

- "The best place in the world to write Tibetan."
- "Tibetan, beautifully written."
- "Word doesn't speak Tibetan. TermaType does."

---

## What TermaType deliberately is NOT

- Not an AI suite
- Not a cloud app
- Not an Office clone
- Its smallness is a feature, not a compromise
