// Type declarations for `tibetan-ewts-converter` (ewts-js), which ships as
// plain ESM with no bundled types. Only the surface we use is declared.
declare module 'tibetan-ewts-converter/EwtsConverter' {
  export interface EwtsConverterOptions {
    /** Emit warnings for illegal sequences (default: true). */
    check?: boolean
    /** Stricter checking (default: true). */
    check_strict?: boolean
    /** Normalise tsheg/spacing (default: true). */
    fix_spacing?: boolean
    /** Accept sloppy/loose Wylie (default: false). */
    sloppy?: boolean
    /** Keep dubious input rather than dropping it (default: false). */
    leave_dubious?: boolean
    /** Pass unknown characters through unchanged (default: false). */
    pass_through?: boolean
  }

  export class EwtsConverter {
    constructor(options?: EwtsConverterOptions)
    /** EWTS (Extended Wylie) → Tibetan Unicode. */
    to_unicode(ewts: string, warnings?: string[]): string
    /** Tibetan Unicode → EWTS (Extended Wylie). */
    to_ewts(unicode: string, warnings?: string[]): string
  }
}
