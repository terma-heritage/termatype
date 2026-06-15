import type { TibetanInputMethod } from '@/components/termatype/tibetan-ime'

const STORAGE_KEY = 'termatype-input-method'

/** The persisted Tibetan input method, defaulting to Wylie on first launch. */
export function getInputMethod(): TibetanInputMethod {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'tcrc' ? 'tcrc' : 'wylie'
  } catch {
    return 'wylie'
  }
}

export function setInputMethod(method: TibetanInputMethod): void {
  try {
    localStorage.setItem(STORAGE_KEY, method)
  } catch {
    /* ignore quota/availability errors */
  }
}
