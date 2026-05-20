export async function checkForUpdates(): Promise<void> {
  try {
    const { check } = await import('@tauri-apps/plugin-updater')
    const update = await check()
    if (!update) return

    const shouldUpdate = confirm(
      `TermaType ${update.version} is available (you have ${update.currentVersion}).\n\nDownload and install now?`
    )
    if (!shouldUpdate) return

    await update.downloadAndInstall()

    const { relaunch } = await import('@tauri-apps/plugin-process')
    await relaunch()
  } catch {
    // silently ignore update check failures
  }
}
