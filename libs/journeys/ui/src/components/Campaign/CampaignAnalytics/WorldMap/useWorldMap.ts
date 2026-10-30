import { useEffect, useState } from 'react'

import { buildWorldMap } from './buildWorldMap'
import type { WorldAtlasTopology, WorldMapShapes } from './buildWorldMap'

const loaded = new Map<string, WorldMapShapes>()
const loading = new Map<string, Promise<WorldMapShapes>>()

/** Fetches and projects the atlas at `atlasUrl` once per page load; a failure is forgotten, so a later mount retries. */
function loadWorldMap(atlasUrl: string): Promise<WorldMapShapes> {
  const pending = loading.get(atlasUrl)
  if (pending != null) return pending
  const load = fetch(atlasUrl)
    .then(async (response) => {
      if (!response.ok) throw new Error(`world map ${response.status}`)
      const shapes = buildWorldMap(
        (await response.json()) as WorldAtlasTopology
      )
      loaded.set(atlasUrl, shapes)
      return shapes
    })
    .catch((error: unknown) => {
      loading.delete(atlasUrl)
      throw error
    })
  loading.set(atlasUrl, load)
  return load
}

export interface WorldMapState {
  /** The projected map; null until the atlas has loaded, and for good if it cannot be. */
  shapes: WorldMapShapes | null
  /** Set when the atlas could not be fetched or projected; the map is then skipped. */
  error: Error | null
}

/**
 * The Analytics world map, fetched in the browser so it never rides in the
 * page props or the server-rendered SVG. `atlasUrl` is the viewer's
 * `countries-110m.json`: same-origin on the public page, the viewer's
 * origin on the editor canvas. Nothing is fetched while `enabled` is off.
 */
export function useWorldMap(enabled: boolean, atlasUrl: string): WorldMapState {
  const [shapes, setShapes] = useState<WorldMapShapes | null>(
    () => loaded.get(atlasUrl) ?? null
  )
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setError(null)
    loadWorldMap(atlasUrl)
      .then((map) => {
        if (!cancelled) setShapes(map)
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
  }, [enabled, atlasUrl])

  return { shapes, error }
}
