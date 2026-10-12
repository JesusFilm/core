import { readFile } from 'fs/promises'
import { join } from 'path'

import { buildWorldMap } from '@core/journeys/ui/Campaign'
import type {
  WorldAtlasTopology,
  WorldMapShapes
} from '@core/journeys/ui/Campaign'

let worldMap: Promise<WorldMapShapes> | undefined

/**
 * The Analytics world map, read from `public/countries-110m.json` (world-atlas
 * 2.0.2) and projected into path strings once per server process, so every
 * campaign page render reuses the same shapes.
 */
export async function getWorldMap(): Promise<WorldMapShapes> {
  worldMap ??= readFile(join(process.cwd(), 'public', 'countries-110m.json'), {
    encoding: 'utf8'
  })
    .then((json) => buildWorldMap(JSON.parse(json) as WorldAtlasTopology))
    .catch((error: unknown) => {
      worldMap = undefined
      throw error
    })
  return await worldMap
}
