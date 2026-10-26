import { geoNaturalEarth1, geoPath } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import { feature } from 'topojson-client'

/** `world-atlas/countries-110m.json`, parsed. */
export type WorldAtlasTopology = Parameters<typeof feature>[0]

export interface WorldMapCountry {
  /** The shape's ISO 3166-1 numeric code; null for shapes the atlas leaves unnumbered (N. Cyprus, Somaliland, Kosovo). */
  id: string | null
  /** The atlas's English name; the label of last resort. */
  name: string
  /** The projected outline as an SVG path string. */
  d: string
  /** The projected bounding box: `[x0, y0, x1, y1]`. */
  bounds: [number, number, number, number]
}

/** The map as plain data: path strings in a `width` × `height` view box. */
export interface WorldMapShapes {
  width: number
  height: number
  countries: WorldMapCountry[]
}

export const WORLD_MAP_WIDTH = 960

const ANTARCTICA_ID = '010'
const PATH_DIGITS = 1

const built = new WeakMap<object, WorldMapShapes>()

/**
 * Projects the atlas once into path strings, so rendering never needs d3 or a
 * `window`. Antarctica is left out: it only shrinks everything else.
 * Memoised on the topology object.
 */
export function buildWorldMap(topology: WorldAtlasTopology): WorldMapShapes {
  const cached = built.get(topology)
  if (cached != null) return cached

  const collection = feature(topology, topology.objects.countries) as {
    features: Array<Feature<Geometry, { name?: string }>>
  }
  const land = collection.features.filter(
    (shape) => shape.id?.toString() !== ANTARCTICA_ID
  )
  const landCollection = { type: 'FeatureCollection' as const, features: land }
  const projection = geoNaturalEarth1().fitWidth(
    WORLD_MAP_WIDTH,
    landCollection
  )
  const path = geoPath(projection).digits(PATH_DIGITS)
  const [, [, bottom]] = path.bounds(landCollection)

  const shapes: WorldMapShapes = {
    width: WORLD_MAP_WIDTH,
    height: Math.ceil(bottom),
    countries: land.flatMap((shape) => {
      const d = path(shape)
      if (d == null) return []
      const [[x0, y0], [x1, y1]] = path.bounds(shape)
      return [
        {
          id: shape.id?.toString() ?? null,
          name: shape.properties.name ?? '',
          d,
          bounds: [x0, y0, x1, y1] as [number, number, number, number]
        }
      ]
    })
  }
  built.set(topology, shapes)
  return shapes
}
