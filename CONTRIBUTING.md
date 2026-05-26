# Contributing to TermaType

Thank you for your interest in contributing to TermaType. This project exists to preserve and strengthen the Tibetan language in the digital age, and every contribution — code, translations, bug reports, documentation, ideas — helps that mission.

## Ways to Contribute

You don't need to be a programmer to help.

- **Report bugs.** Found something that doesn't work? Open an [issue](https://github.com/terma-heritage/termatype/issues) describing what happened and what you expected.
- **Suggest features.** Open an issue with the label `enhancement`.
- **Improve documentation.** Typos, unclear explanations, missing examples — all welcome.
- **Help with translations.** TermaType's interface should be available in Tibetan and other languages spoken by users.
- **Test on different systems.** Try TermaType on your hardware and report what works and what doesn't.
- **Share with your community.** Tell Tibetan writers, scholars, translators, and learners about the project.
- **Contribute code.** See below.

## Reporting Bugs

Before opening a new issue, please search [existing issues](https://github.com/terma-heritage/termatype/issues) to avoid duplicates.

When reporting a bug, include:

- TermaType version (Help → About, or check the title bar)
- Operating system and version (e.g., Windows 11, macOS 14.5)
- Steps to reproduce the problem
- What you expected to happen
- What actually happened
- Screenshots or screen recordings if relevant

## Suggesting Features

Open an issue with a clear description of:

- The problem you're trying to solve
- How you imagine TermaType could solve it
- Any alternatives you've considered

Feature requests aligned with TermaType's core values (offline-first, privacy-respecting, free, focused on Tibetan and English) are most likely to be accepted.

## Contributing Code

### Development Setup

TermaType is built with [Tauri 2](https://tauri.app/), React, TypeScript, and Rust. You'll need:

- [Node.js](https://nodejs.org/) (v20 or later)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- Platform-specific Tauri prerequisites: see the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/)

To get started:

```bash
git clone https://github.com/terma-heritage/termatype.git
cd termatype
npm install
npm run tauri dev
```

### Pull Request Process

1. Fork the repository and create a branch for your change (`feature/your-feature` or `fix/your-fix`).
2. Make your changes. Keep commits focused and write clear commit messages.
3. Test your changes locally on at least one platform (Windows or macOS).
4. Open a pull request against the `main` branch. Describe what your change does and why.
5. A maintainer will review your PR. Be patient — this project is maintained by a small team.

### Code Style

- TypeScript: follow the existing patterns in the codebase. ESLint is configured.
- Rust: run `cargo fmt` before submitting.
- Keep changes focused. Large refactors should be discussed in an issue first.

## Translating TermaType

If you'd like to help translate TermaType's interface into another language, please open an issue with the label `translation` and we'll coordinate with you.

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). In short: be respectful, be kind, and assume good faith.

## Licensing

TermaType is licensed under GPL-3.0. By contributing, you agree that your contributions will be licensed under the same terms.

## Questions

If you have questions that don't fit a bug report or feature request, open a [Discussion](https://github.com/terma-heritage/termatype/discussions) or email us at info@termafoundation.org.

---

*This software is offered freely for the benefit of all beings. Thank you for helping it grow.*
