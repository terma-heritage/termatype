import { invoke as tauriInvoke } from '@tauri-apps/api/core'

export function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!(window as any).__TAURI_INTERNALS__) {
    return Promise.reject(new Error('Not in Tauri environment'))
  }
  return tauriInvoke<T>(cmd, args)
}
