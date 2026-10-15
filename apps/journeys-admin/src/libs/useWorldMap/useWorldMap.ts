import { useEffect, useState } from 'react'

import type {
  WorldAtlasTopology,
  WorldMapShapes
} from '@core/journeys/ui/Campaign'
import { buildWorldMap } from '@core/journeys/ui/Campaign/CampaignAnalytics/WorldMap/buildWorldMap'

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

interface UseWorldMapResult {
  shapes: WorldMapShapes | null
  /** Set when the atlas could not be fetched or projected, so the editor can say why the map is missing. */
  error: Error | null
}

/**
 * The Analytics world map for the editor canvas, which has no server render
 * to carry it: `shapes` is null until the viewer's atlas has loaded, and for
 * good if it cannot be fetched, in which case `error` is set (the map is then
 * skipped, the rest of the section stays).
 */
export function useWorldMap(enabled: boolean): UseWorldMapResult {
  const [shapes, setShapes] = useState<WorldMapShapes | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setError(null)
    loadWorldMap()
      .then((loaded) => {
        if (!cancelled) setShapes(loaded)
      })
      .catch((failure: unknown) => {
        if (cancelled) return
        setError(
          failure instanceof Error ? failure : new Error(String(failure))
        )
      })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { shapes, error }
}
