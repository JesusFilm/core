import { readFileSync } from 'fs'
import { resolve } from 'path'

import type { WorldAtlasTopology } from '../../components/Campaign/CampaignAnalytics/WorldMap'

/** A country shape of the atlas: its numeric id (absent on the three it leaves unnumbered) and English name. */
export interface WorldAtlasCountry {
  id?: string
  properties: { name: string }
}

// The viewer serves the atlas from its public folder; the file stays there and every spec reads it from here.
const parsed = JSON.parse(
  readFileSync(
    resolve(
      __dirname,
      '../../../../../../apps/journeys/public/countries-110m.json'
    ),
    'utf8'
  )
)

/** The viewer's `countries-110m.json` world atlas, read and parsed once. */
export const worldAtlas: WorldAtlasTopology = parsed

/** The atlas's country shapes. */
export const worldAtlasCountries: WorldAtlasCountry[] =
  parsed.objects.countries.geometries
