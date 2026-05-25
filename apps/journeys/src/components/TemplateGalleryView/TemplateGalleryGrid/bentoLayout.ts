export interface BentoSpan {
  /** Number of grid columns the tile spans. */
  col: number
  /** Number of grid rows the tile spans. */
  row: number
}

/** Distribute `columns` of width across `tiles` cells as evenly as possible. */
function evenWidths(tiles: number, columns: number): number[] {
  const base = Math.floor(columns / tiles)
  const extra = columns - base * tiles
  return Array.from({ length: tiles }, (_, index) =>
    index < extra ? base + 1 : base
  )
}

/**
 * Per-tile spans for a Bento grid that completely fills a rectangle (a flush
 * bottom edge) for any tile count, while keeping varied rectangular tiles.
 *
 * The layout is a vertical stack of full-width bands, so every row is
 * complete and nothing juts out past the bottom:
 *  - an optional top "feature" band — a 2×2 tile flanked by tall (1×2) tiles
 *    so it fills two whole rows;
 *  - then one-row bands whose tile widths always sum to `columns`.
 *
 * Tiles are returned in reading order to match CSS `grid-auto-flow: row`,
 * so the caller only needs per-tile spans (no explicit cell coordinates).
 */
export function bentoLayout(count: number, columns: number): BentoSpan[] {
  if (count <= 0) return []
  const spans: BentoSpan[] = []

  const flankers = Math.max(0, columns - 2)
  const featureBandTiles = 1 + flankers
  // Use the feature band unless it would strand exactly one trailing tile,
  // which could only be filled by an ugly full-width banner.
  const useFeature =
    count >= featureBandTiles && count - featureBandTiles !== 1
  if (useFeature) {
    spans.push({ col: 2, row: 2 })
    for (let i = 0; i < flankers; i += 1) spans.push({ col: 1, row: 2 })
  }

  let remaining = count - spans.length
  const varietyWidths =
    columns >= 4 ? [2, 1, 1] : columns === 3 ? [2, 1] : [1, 1]
  const singleWidths = Array.from({ length: columns }, () => 1)

  const pushRow = (widths: number[]): void => {
    widths.forEach((width) => spans.push({ col: width, row: 1 }))
  }

  let useVariety = true
  while (remaining > columns) {
    let widths = useVariety ? varietyWidths : singleWidths
    // Never leave a single trailing tile for the final band — swap the row
    // size so the remainder lands on a count the final band can fill cleanly.
    if (remaining - widths.length === 1) {
      widths = widths.length === columns ? varietyWidths : singleWidths
    }
    pushRow(widths)
    remaining -= widths.length
    useVariety = !useVariety
  }
  if (remaining > 0) pushRow(evenWidths(remaining, columns))

  return spans
}
