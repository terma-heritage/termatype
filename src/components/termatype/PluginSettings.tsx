import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@/lib/safe-invoke'
import { listen } from '@tauri-apps/api/event'

interface PluginInfo {
  id: string
  name: string
  description: string
  version: string
  download_url: string
  file_name: string
  size_mb: number
  installed: boolean
}

interface DownloadProgress {
  pluginId: string
  progress: number
  downloaded: number
  total: number
}

export function PluginSettings({ onClose }: { onClose: () => void }) {
  const [plugins, setPlugins] = useState<PluginInfo[]>([])
  const [downloading, setDownloading] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  const loadPlugins = useCallback(async () => {
    try {
      const result = await invoke<PluginInfo[]>('get_plugins')
      setPlugins(result)
    } catch (e) {
      setError(String(e))
    }
  }, [])

  useEffect(() => {
    loadPlugins()
  }, [loadPlugins])

  useEffect(() => {
    let mounted = true
    const unlisteners: (() => void)[] = []

    listen<DownloadProgress>('plugin-download-progress', (event) => {
      if (!mounted) return
      setDownloading((prev) => ({
        ...prev,
        [event.payload.pluginId]: event.payload.progress,
      }))
    }).then((fn) => { if (mounted) unlisteners.push(fn); else fn() })

    listen<{ pluginId: string }>('plugin-installed', (event) => {
      if (!mounted) return
      setDownloading((prev) => {
        const next = { ...prev }
        delete next[event.payload.pluginId]
        return next
      })
      loadPlugins()
    }).then((fn) => { if (mounted) unlisteners.push(fn); else fn() })

    return () => {
      mounted = false
      unlisteners.forEach((fn) => fn())
    }
  }, [loadPlugins])

  const handleInstall = async (pluginId: string) => {
    setError(null)
    setDownloading((prev) => ({ ...prev, [pluginId]: 0 }))
    try {
      await invoke('install_plugin', { pluginId })
    } catch (e) {
      setError(String(e))
      setDownloading((prev) => {
        const next = { ...prev }
        delete next[pluginId]
        return next
      })
    }
  }

  const handleUninstall = async (pluginId: string) => {
    setError(null)
    try {
      await invoke('uninstall_plugin', { pluginId })
      loadPlugins()
    } catch (e) {
      setError(String(e))
    }
  }

  return (
    <div className="plugin-settings-overlay" onClick={onClose}>
      <div className="plugin-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="plugin-settings-header">
          <h2>Extensions</h2>
          <button className="plugin-settings-close" onClick={onClose} aria-label="Close extensions">
            ✕
          </button>
        </div>

        {error && <div className="plugin-error">{error}</div>}

        <div className="plugin-list">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="plugin-card">
              <div className="plugin-card-info">
                <h3>{plugin.name}</h3>
                <p>{plugin.description}</p>
                <span className="plugin-meta">
                  v{plugin.version} · {plugin.size_mb} MB
                </span>
              </div>
              <div className="plugin-card-action">
                {downloading[plugin.id] !== undefined ? (
                  <div className="plugin-progress">
                    <div
                      className="plugin-progress-bar"
                      style={{ width: `${downloading[plugin.id]}%` }}
                    />
                    <span>{downloading[plugin.id]}%</span>
                  </div>
                ) : plugin.installed ? (
                  <button
                    className="plugin-btn plugin-btn-uninstall"
                    onClick={() => handleUninstall(plugin.id)}
                  >
                    Uninstall
                  </button>
                ) : (
                  <button
                    className="plugin-btn plugin-btn-install"
                    onClick={() => handleInstall(plugin.id)}
                  >
                    Install
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
