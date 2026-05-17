const STORAGE_KEY = 'termatype-snapshots'
const MAX_SNAPSHOTS = 50

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots))
}

export function createSnapshot(fileName: string, content: string, label?: string): Snapshot {
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

export function getAllSnapshots(): Snapshot[] {
  return getSnapshots()
}

export function deleteSnapshot(id: string) {
  const snapshots = getSnapshots().filter((s) => s.id !== id)
  saveSnapshots(snapshots)
}

export function getSnapshot(id: string): Snapshot | undefined {
  return getSnapshots().find((s) => s.id === id)
}
