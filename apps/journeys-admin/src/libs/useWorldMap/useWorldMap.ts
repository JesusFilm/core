import { useEffect, useState } from 'react'

import { buildWorldMap } from '@core/journeys/ui/Campaign'
import type {
  WorldAtlasTopology,
  WorldMapShapes
} from '@core/journeys/ui/Campaign'

const JOURNEYS_URL =
  process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'

let worldMap: Promise<WorldMapShapes> | undefined

/** `countries-110m.json` lives in the viewer's public folder; fetched and projected once per page load. */
function loadWorldMap(): Promise<WorldMapShapes> {
  worldMap ??= fetch(`${JOURNEYS_URL}/countries-110m.json`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`world map ${response.status}`)
      return buildWorldMap((await response.json()) as WorldAtlasTopology)
    })
    .catch((error: unknown) => {
      worldMap = undefined
      throw error
    })
  return worldMap
}

/**
 * The Analytics world map for the editor canvas, which has no server render
 * to carry it: null until the viewer's atlas has loaded, and for good if it
 * cannot be fetched (the map is then skipped, the rest of the section stays).
 */
export function useWorldMap(enabled: boolean): WorldMapShapes | null {
  const [shapes, setShapes] = useState<WorldMapShapes | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    loadWorldMap()
      .then((loaded) => {
        if (!cancelled) setShapes(loaded)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [enabled])

  return shapes
}
