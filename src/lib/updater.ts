import type { Update } from '@tauri-apps/plugin-updater'

let pendingUpdate: Update | null = null

export interface UpdateInfo {
  version: string
  currentVersion: string
}

type UpdateListener = (info: UpdateInfo) => void

const listeners: Set<UpdateListener> = new Set()

export function onUpdateAvailable(fn: UpdateListener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function checkForUpdates(): Promise<void> {
  try {
    const { check } = await import('@tauri-apps/plugin-updater')
    const update = await check()
    if (!update) return

    pendingUpdate = update
    const info: UpdateInfo = {
      version: update.version,
      currentVersion: update.currentVersion,
    }
    listeners.forEach(fn => fn(info))
  } catch {
    // silently ignore update check failures
  }
}

export async function installUpdate(): Promise<void> {
  if (!pendingUpdate) return
  try {
    await pendingUpdate.downloadAndInstall()
    const { relaunch } = await import('@tauri-apps/plugin-process')
    await relaunch()
  } catch (err) {
    console.error('Update failed:', err)
    throw err
  }
}

export function dismissUpdate(): void {
  pendingUpdate = null
}
