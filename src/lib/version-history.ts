const STORAGE_KEY = 'termatype-snapshots'
const MAX_SNAPSHOTS = 50
const MAX_CONTENT_SIZE = 500_000

export interface Snapshot {
  id: string
  timestamp: number
  fileName: string
  label: string
  content: string
}

function getSnapshots(): Snapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSnapshots(snapshots: Snapshot[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots))
  } catch {
    while (snapshots.length > 1) {
      snapshots.pop()
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots))
        return
      } catch {
        // keep removing until it fits
      }
    }
  }
}

export function createSnapshot(fileName: string, content: string, label?: string): Snapshot | null {
  if (content.length > MAX_CONTENT_SIZE) return null

  const snapshots = getSnapshots()
  const snapshot: Snapshot = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    fileName,
    label: label || `Auto-save`,
    content,
  }
  snapshots.unshift(snapshot)
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.length = MAX_SNAPSHOTS
  saveSnapshots(snapshots)
  return snapshot
}

export function getSnapshotsForFile(fileName: string): Snapshot[] {
  return getSnapshots().filter((s) => s.fileName === fileName)
}

export function deleteSnapshot(id: string) {
  const snapshots = getSnapshots().filter((s) => s.id !== id)
  saveSnapshots(snapshots)
}

