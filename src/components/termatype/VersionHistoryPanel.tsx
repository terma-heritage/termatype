import { useState, useEffect, useRef } from 'react'
import { useFocusTrap } from '@/hooks/use-focus-trap'
import { getSnapshotsForFile, deleteSnapshot, type Snapshot } from '@/lib/version-history'

export function VersionHistoryPanel({ fileName, onRestore, onClose }: { fileName: string; onRestore: (content: string) => void; onClose: () => void }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef)

  useEffect(() => {
    setSnapshots(getSnapshotsForFile(fileName))
  }, [fileName])

  const handleDelete = (id: string) => {
    deleteSnapshot(id)
    setSnapshots(getSnapshotsForFile(fileName))
  }

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-panel version-history-panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h3>Version History</h3>
          <button className="shortcuts-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="shortcuts-body">
          {snapshots.length === 0 ? (
            <p style={{ opacity: 0.6, textAlign: 'center', padding: '2rem' }}>No snapshots yet. Snapshots are created when you save.</p>
          ) : (
            snapshots.map((snap) => (
              <div key={snap.id} className="version-history-item">
                <div className="version-history-info">
                  <span className="version-history-label">{snap.label}</span>
                  <span className="version-history-time">{new Date(snap.timestamp).toLocaleString()}</span>
                </div>
                <div className="version-history-actions">
                  <button onClick={() => { onRestore(snap.content); onClose() }}>Restore</button>
                  <button onClick={() => handleDelete(snap.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
