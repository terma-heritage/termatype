export interface DictResult {
  headword: string
  headword_wylie: string | null
  definition: string
  source: string
  source_name: string
}

export const isTibetan = (text: string) => /[ༀ-࿿]/.test(text)
