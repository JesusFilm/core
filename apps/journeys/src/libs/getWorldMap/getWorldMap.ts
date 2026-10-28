import type {
  WorldAtlasTopology,
  WorldMapShapes
} from '@core/journeys/ui/Campaign'
import { buildWorldMap } from '@core/journeys/ui/Campaign/CampaignAnalytics/WorldMap/buildWorldMap'

import topology from '../../../public/countries-110m.json'

let worldMap: WorldMapShapes | undefined

/**
 * The Analytics world map, projected from `public/countries-110m.json`
 * (world-atlas 2.0.2) into path strings once per server process, so every
 * campaign page render reuses the same shapes. The topology is a module
 * import, not a read from disk, so it ships in the function bundle.
 */
export async function getWorldMap(): Promise<WorldMapShapes> {
  worldMap ??= buildWorldMap(topology as unknown as WorldAtlasTopology)
  return worldMap
}
