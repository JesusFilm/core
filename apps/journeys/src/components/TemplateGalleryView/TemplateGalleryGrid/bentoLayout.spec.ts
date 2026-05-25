import { BentoSpan, bentoLayout } from './bentoLayout'

/**
 * Simulate CSS `grid-auto-flow: row` placement: each tile goes in the first
 * free cell (scanning top-to-bottom, left-to-right) where its span fits
 * entirely within the column count. Returns the filled grid as a matrix.
 */
function pack(spans: BentoSpan[], columns: number): boolean[][] {
  const grid: boolean[][] = []
  const ensureRow = (r: number): void => {
    while (grid.length <= r) grid.push(new Array(columns).fill(false))
  }
  const fits = (r: number, c: number, span: BentoSpan): boolean => {
    if (c + span.col > columns) return false
    for (let dr = 0; dr < span.row; dr += 1) {
      ensureRow(r + dr)
      for (let dc = 0; dc < span.col; dc += 1) {
        if (grid[r + dr][c + dc]) return false
      }
    }
    return true
  }
  const place = (r: number, c: number, span: BentoSpan): void => {
    for (let dr = 0; dr < span.row; dr += 1) {
      for (let dc = 0; dc < span.col; dc += 1) grid[r + dr][c + dc] = true
    }
  }
  for (const span of spans) {
    let placed = false
    for (let r = 0; !placed; r += 1) {
      ensureRow(r)
      for (let c = 0; c < columns && !placed; c += 1) {
        if (!grid[r][c] && fits(r, c, span)) {
          place(r, c, span)
          placed = true
        }
      }
    }
  }
  return grid
}

describe('bentoLayout', () => {
  const columnCounts = [2, 3, 4]
  const tileCounts = Array.from({ length: 24 }, (_, i) => i + 1)

  it.each(columnCounts)(
    'returns one span per tile and only valid spans (%i columns)',
    (columns) => {
      tileCounts.forEach((count) => {
        const spans = bentoLayout(count, columns)
        expect(spans).toHaveLength(count)
        spans.forEach((span) => {
          expect(span.col).toBeGreaterThanOrEqual(1)
          expect(span.col).toBeLessThanOrEqual(columns)
          expect(span.row).toBeGreaterThanOrEqual(1)
        })
      })
    }
  )

  it.each(columnCounts)(
    'packs into a completely filled rectangle — no gaps, no overhang (%i columns)',
    (columns) => {
      tileCounts.forEach((count) => {
        const grid = pack(bentoLayout(count, columns), columns)
        const everyCellFilled = grid.every((row) => row.every(Boolean))
        expect({ count, columns, everyCellFilled }).toEqual({
          count,
          columns,
          everyCellFilled: true
        })
      })
    }
  )

  it('builds a feature band (2×2 plus tall flankers) when there is room', () => {
    const spans = bentoLayout(10, 4)
    expect(spans[0]).toEqual({ col: 2, row: 2 })
    // Two tall (1×2) flankers fill the rest of the feature band's two rows.
    expect(spans[1]).toEqual({ col: 1, row: 2 })
    expect(spans[2]).toEqual({ col: 1, row: 2 })
  })
})
