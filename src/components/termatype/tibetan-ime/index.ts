// Public surface of the Tibetan Wylie IME module.
//
// This folder is self-contained and meant to be portable: the only file that
// depends on the editor framework is `tibetan-ime-extension.ts` (TipTap). The
// conversion core (`ewts.ts`) and the input adapter (`wylie-engine.ts`) are
// framework-agnostic and depend only on the `tibetan-ewts-converter` package.
//
// See README.md for the design and how to reuse this in other projects.

export { wylieToUnicode } from './ewts'
export { WylieEngine } from './wylie-engine'
export { TcrcEngine } from './tcrc-engine'
export { TCRC_KEYMAP, type TcrcKey, type TcrcKind } from './tcrc-map'
export {
  type EngineResult,
  type InputEngine,
  type TibetanInputMethod,
} from './input-engine'
export { createTibetanIMEExtension } from './tibetan-ime-extension'
export {
  TIBETAN_MARK_GROUPS,
  type TibetanMark,
  type TibetanMarkGroup,
} from './tibetan-marks'
