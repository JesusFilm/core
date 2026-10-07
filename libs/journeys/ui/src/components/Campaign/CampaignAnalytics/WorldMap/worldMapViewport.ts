import type { WorldMapShapes } from './buildWorldMap'

export interface WorldMapViewport {
  x: number
  y: number
  scale: number
}

export const WORLD_VIEWPORT: WorldMapViewport = { x: 0, y: 0, scale: 1 }

const MAX_SCALE = 6
const FILL_RATIO = 0.8

/**
 * The translate and scale that fit the bounding box of the shapes with these
 * numeric ids into the view box, centred. The world (no zoom) when none of
 * the ids has a shape, so a region with no countries, or only countries the
 * 110m atlas lacks, shows the whole map.
 */
export function viewportFor(
  shapes: WorldMapShapes,
  numericIds: ReadonlySet<string>
): WorldMapViewport {
  const selected = shapes.countries.filter(
    (country) => country.id != null && numericIds.has(country.id)
  )
  if (selected.length === 0) return WORLD_VIEWPORT

  const x0 = Math.min(...selected.map((country) => country.bounds[0]))
  const y0 = Math.min(...selected.map((country) => country.bounds[1]))
  const x1 = Math.max(...selected.map((country) => country.bounds[2]))
  const y1 = Math.max(...selected.map((country) => country.bounds[3]))
  const boxWidth = Math.max(x1 - x0, 1)
  const boxHeight = Math.max(y1 - y0, 1)
  const scale = Math.min(
    MAX_SCALE,
    (shapes.width / boxWidth) * FILL_RATIO,
    (shapes.height / boxHeight) * FILL_RATIO
  )
  if (scale <= 1) return WORLD_VIEWPORT

  return {
    scale,
    x: shapes.width / 2 - (scale * (x0 + x1)) / 2,
    y: shapes.height / 2 - (scale * (y0 + y1)) / 2
  }
}

/** The viewport as a CSS transform, so a change animates with a plain `transition`. */
export function viewportTransform({ x, y, scale }: WorldMapViewport): string {
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`
}
