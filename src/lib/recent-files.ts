const STORAGE_KEY = 'termatype-recent-files'
const MAX_RECENT = 10

export function getRecentFiles(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentFile(path: string): void {
  const files = getRecentFiles().filter((f) => f !== path)
  files.unshift(path)
  if (files.length > MAX_RECENT) files.length = MAX_RECENT
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
}

export function clearRecentFiles(): void {
  localStorage.removeItem(STORAGE_KEY)
}
