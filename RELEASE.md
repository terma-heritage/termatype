# Release checklist

TermaType ships through **three independent channels**. Only the first
auto-updates — the two stores require a fresh submission every release.

## 0. Before you build

- [ ] All "must-do" TODOs cleared (TCRC keymap verified, macOS export confirmed).
- [ ] Update `CHANGELOG.md` — move `Unreleased` to the new version + date.
- [ ] **Bump the version in BOTH files** (stores reject equal/lower versions):
  - `package.json` → `version`
  - `src-tauri/tauri.conf.json` → `version`
  - (The store configs `tauri.microsoftstore.conf.json` / `tauri.appstore.conf.json`
    inherit the version — no separate bump.)
- [ ] Versioning: new features, no breaking changes → **minor** bump (e.g. 2.0.1 → 2.1.0).
  Reserve a **major** bump for breaking changes (file format, ground-up redesign).

## 1. GitHub / direct download — AUTO-UPDATES ✅

Installed `.msi` / `.dmg` users self-update via `tauri-plugin-updater`.

- [ ] Build the default targets.
- [ ] Publish the GitHub release **with the updater artifacts** (`latest.json` +
      the per-platform signatures). Without these, auto-update silently does nothing.

## 2. Microsoft Store — RESUBMIT ⛔ (no auto-update from your build)

- [ ] `npm run pack:msix` (builds the MSIX).
- [ ] Upload to **Partner Center**, pass certification, release.
- [ ] The Store then delivers the update to users automatically.

## 3. Apple App Store — RESUBMIT ⛔ (no auto-update; updater is disabled in sandbox)

- [ ] `npm run pack:appstore` (sandboxed build).
- [ ] Upload to **App Store Connect**.
- [ ] **Verify via TestFlight first** — install the sandboxed build and test
      PDF/EPUB export and saving before submitting for review.
- [ ] Submit for App Review, then release.

### App Store CI gotchas (learned the hard way)

- OpenSSL **legacy flag** needed for the signing step.
- **Keychain timeouts** — unlock/extend the keychain in CI.
- **Skip `.pkg` signing** where it isn't required (it broke the upload).
- Don't ship the **updater artifacts** in the App Store build (updater is off there).

## After release

- [ ] Confirm GitHub auto-update actually lands for an existing install.
- [ ] Confirm the new version is **live in both stores** (they lag review/cert by
      hours–days — easy to ship GitHub and forget the stores are still on the old build).
