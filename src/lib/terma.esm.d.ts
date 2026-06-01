declare const terma: {
  prepare(el: HTMLElement): void
  prepareAll(selector?: string): void
  prepareEditable(el: HTMLElement): void
  prepareAllEditables(selector?: string): void
  cluster(el: HTMLElement): void
  clusterAll(selector?: string): void
  normalize(el: HTMLElement): void
  normalizeAll(selector?: string): void
  alignHeadMarks(el: HTMLElement): void
  alignHeadMarksAll(selector?: string): void
  measureAscentRatio(fontFamily: string): number | null
}
export default terma
