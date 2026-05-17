import { useState, useCallback } from 'react'

const MAX_ROWS = 8
const MAX_COLS = 8

export function TableGridPicker({
  onSelect,
}: {
  onSelect: (rows: number, cols: number) => void
}) {
  const [hoverRow, setHoverRow] = useState(0)
  const [hoverCol, setHoverCol] = useState(0)

  const handleMouseEnter = useCallback((r: number, c: number) => {
    setHoverRow(r)
    setHoverCol(c)
  }, [])

  return (
    <div className="table-grid-picker">
      <div className="table-grid">
        {Array.from({ length: MAX_ROWS }, (_, r) => (
          <div key={r} className="table-grid-row">
            {Array.from({ length: MAX_COLS }, (_, c) => (
              <div
                key={c}
                className={`table-grid-cell ${
                  r < hoverRow && c < hoverCol ? 'active' : ''
                }`}
                onMouseEnter={() => handleMouseEnter(r + 1, c + 1)}
                onClick={() => onSelect(hoverRow, hoverCol)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="table-grid-label">
        {hoverRow > 0 && hoverCol > 0
          ? `${hoverCol} × ${hoverRow}`
          : 'Select size'}
      </div>
    </div>
  )
}
