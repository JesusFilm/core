'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import maplibregl, {
  type LngLatBoundsLike,
  Map as MapInstance,
  type MapLayerMouseEvent,
  type MapMouseEvent,
  type MapboxGeoJSONFeature
} from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { LanguageMapPoint } from '../../../libs/useLanguageMap'

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const SOURCE_ID = 'language-countries'
const COUNTRY_FILL_LAYER_ID = 'language-country-fill'
const COUNTRY_BORDER_LAYER_ID = 'language-country-border'
const COUNTRY_COUNT_LAYER_ID = 'language-country-count'
const COUNTRY_COLORS = [
  '#A8A29E', // Stone 500
  '#78716C', // Stone 600
  '#57534E', // Stone 700
  '#44403C', // Stone 800
  '#292524', // Stone 900
  '#D6D3D1', // Stone 300
  '#E7E5E4', // Stone 200
  '#F5F5F4', // Stone 100
  '#FAFAF9', // Stone 50
  '#CFCBC9' // Stone 400
]

function toFlagEmoji(countryId: string): string {
  if (countryId.length !== 2) {
    return '🏳️'
  }

  const codePoints = [...countryId.toUpperCase()].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
  if (codePoints.some((value) => value < 0x1f1e6 || value > 0x1f1ff)) {
    return '🏳️'
  }

  return String.fromCodePoint(...codePoints)
}

interface LanguageMapProps {
  points: LanguageMapPoint[]
  unsupportedMessage?: string
}

type CountryFeatureGeometry = Polygon | MultiPolygon

interface CountryShapeProperties {
  name?: string
  'ISO3166-1-Alpha-3'?: string
  'ISO3166-1-Alpha-2'?: string
}

type CountryShapeFeature = Feature<CountryFeatureGeometry, CountryShapeProperties>
type CountryShapeCollection = FeatureCollection<CountryFeatureGeometry, CountryShapeProperties>

interface CountryShapeData {
  geometry: CountryFeatureGeometry
  iso2?: string
  iso3?: string
  name?: string
}

interface CountryShapeIndex {
  byCode: Map<string, CountryShapeData>
  byName: Map<string, CountryShapeData>
}

interface CountryLanguage {
  id: string
  code: string
  languageName: string
  englishName?: string
  nativeName?: string
  isPrimary: boolean
  speakers: number
}

interface CountryAggregation {
  countryId: string
  countryName: string
  languages: CountryLanguage[]
  bounds: LngLatBoundsLike
  feature: GeoJSONCountryFeature
  iso2Code?: string
}

interface CountryFeatureProperties {
  featureId: string
  countryId: string
  countryName: string
  languageCount: number
  labelText: string
  fillColor: string
  iso2Code?: string
  iso3Code?: string
}

type GeoJSONCountryFeature = Feature<CountryFeatureGeometry, CountryFeatureProperties>

type CountryFeatureCollection = FeatureCollection<CountryFeatureGeometry, CountryFeatureProperties>

function normalizeCountryKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
}

function createCountryShapeIndex(features: CountryShapeFeature[]): CountryShapeIndex {
  const byCode = new Map<string, CountryShapeData>()
  const byName = new Map<string, CountryShapeData>()

  for (const feature of features) {
    if (feature.geometry == null) continue

    const iso2 = feature.properties?.['ISO3166-1-Alpha-2']?.toUpperCase()
    const iso3 = feature.properties?.['ISO3166-1-Alpha-3']?.toUpperCase()
    const name = feature.properties?.name

    const data: CountryShapeData = {
      geometry: feature.geometry,
      iso2,
      iso3,
      name
    }

    if (iso2 != null && iso2 !== '') {
      byCode.set(iso2, data)
    }

    if (iso3 != null && iso3 !== '') {
      byCode.set(iso3, data)
    }

    if (name != null && name !== '') {
      byName.set(normalizeCountryKey(name), data)
    }
  }

  return { byCode, byName }
}

function computeBoundsFromGeometry(geometry: CountryFeatureGeometry): LngLatBoundsLike {
  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  const processCoordinate = ([lng, lat]: number[]): void => {
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }

  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      for (const coordinate of ring) {
        processCoordinate(coordinate)
      }
    }
  } else {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const coordinate of ring) {
          processCoordinate(coordinate)
        }
      }
    }
  }

  if (!Number.isFinite(minLng) || !Number.isFinite(maxLng) || !Number.isFinite(minLat) || !Number.isFinite(maxLat)) {
    return [
      [-180, -90],
      [180, 90]
    ]
  }

  const lngPadding = (maxLng - minLng) === 0 ? 0.8 : (maxLng - minLng) * 0.15
  const latPadding = (maxLat - minLat) === 0 ? 0.8 : (maxLat - minLat) * 0.15

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding]
  ]
}

function findCountryShape(
  countryId: string,
  countryName: string | undefined,
  shapeIndex: CountryShapeIndex | null
): CountryShapeData | null {
  if (shapeIndex == null) {
    return null
  }

  const uppercaseId = countryId.toUpperCase()

  const directMatch = shapeIndex.byCode.get(uppercaseId)
  if (directMatch != null) {
    return directMatch
  }

  if (uppercaseId.length > 3) {
    const shortId = uppercaseId.slice(0, 3)
    const fallbackMatch = shapeIndex.byCode.get(shortId)
    if (fallbackMatch != null) {
      return fallbackMatch
    }
  }

  if (uppercaseId.length === 3) {
    const iso2Candidate = uppercaseId.slice(0, 2)
    const iso2Match = shapeIndex.byCode.get(iso2Candidate)
    if (iso2Match != null) {
      return iso2Match
    }
  }

  if (countryName != null && countryName !== '') {
    const normalized = normalizeCountryKey(countryName)
    const nameMatch = shapeIndex.byName.get(normalized)
    if (nameMatch != null) {
      return nameMatch
    }
  }

  return null
}

function aggregateCountries(
  points: LanguageMapPoint[],
  shapeIndex: CountryShapeIndex | null
): CountryAggregation[] {
  const map = new Map<
    string,
    {
      countryId: string
      countryName: string
      minLng: number
      maxLng: number
      minLat: number
      maxLat: number
      languages: Map<string, CountryLanguage>
      shape: CountryShapeData | null
    }
  >()

  for (const point of points) {
    let record = map.get(point.countryId)

    if (record == null) {
      record = {
        countryId: point.countryId,
        countryName: point.countryName ?? 'Unknown country',
        minLng: point.longitude,
        maxLng: point.longitude,
        minLat: point.latitude,
        maxLat: point.latitude,
        languages: new Map(),
        shape: findCountryShape(point.countryId, point.countryName, shapeIndex)
      }
      map.set(point.countryId, record)
    }

    if ((record.countryName === 'Unknown country' || record.countryName === '') && point.countryName) {
      record.countryName = point.countryName
    }

    if (record.shape == null) {
      record.shape = findCountryShape(point.countryId, point.countryName, shapeIndex)
    }

    record.minLng = Math.min(record.minLng, point.longitude)
    record.maxLng = Math.max(record.maxLng, point.longitude)
    record.minLat = Math.min(record.minLat, point.latitude)
    record.maxLat = Math.max(record.maxLat, point.latitude)

    const existingLanguage = record.languages.get(point.languageId)
    if (existingLanguage == null) {
      record.languages.set(point.languageId, {
        id: point.languageId,
        code: point.languageId,
        languageName: point.languageName,
        englishName: point.englishName,
        nativeName: point.nativeName,
        isPrimary: point.isPrimaryCountryLanguage,
        speakers: point.speakers
      })
    } else if (point.isPrimaryCountryLanguage && !existingLanguage.isPrimary) {
      record.languages.set(point.languageId, { ...existingLanguage, isPrimary: true })
    }
  }

  return Array.from(map.values()).map((country, index) => {
    const languages = Array.from(country.languages.values()).sort((a, b) =>
      b.speakers - a.speakers
    )

    const languageCount = languages.length

    const geometry = country.shape?.geometry

    let featureGeometry: CountryFeatureGeometry
    let bounds: LngLatBoundsLike

    if (geometry != null) {
      featureGeometry = geometry
      bounds = computeBoundsFromGeometry(geometry)
    } else {
      const lngRange = country.maxLng - country.minLng
      const latRange = country.maxLat - country.minLat
      const lngPadding = lngRange === 0 ? 0.6 : lngRange * 0.2
      const latPadding = latRange === 0 ? 0.6 : latRange * 0.2

      const west = country.minLng - lngPadding
      const east = country.maxLng + lngPadding
      const south = country.minLat - latPadding
      const north = country.maxLat + latPadding

      const fallbackPolygon: Polygon = {
        type: 'Polygon',
        coordinates: [
          [
            [west, south],
            [east, south],
            [east, north],
            [west, north],
            [west, south]
          ]
        ]
      }

      featureGeometry = fallbackPolygon
      bounds = [
        [west, south],
        [east, north]
      ]
    }

    const feature: GeoJSONCountryFeature = {
      type: 'Feature',
      id: country.countryId,
      geometry: featureGeometry,
      properties: {
        featureId: country.countryId,
        countryId: country.countryId,
        countryName: country.countryName,
        languageCount,
        labelText: String(languageCount),
        fillColor: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
        iso2Code: country.shape?.iso2,
        iso3Code: country.shape?.iso3
      }
    }

    return {
      countryId: country.countryId,
      countryName: country.countryName,
      languages,
      bounds,
      feature,
      iso2Code: country.shape?.iso2
    }
  })
}

function createFeatureCollection(countries: CountryAggregation[]): CountryFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: countries.map((country) => country.feature)
  }
}

function isCountryFeature(
  feature: MapboxGeoJSONFeature | undefined
): feature is MapboxGeoJSONFeature & { properties: CountryFeatureProperties } {
  return (
    (feature?.geometry?.type === 'Polygon' || feature?.geometry?.type === 'MultiPolygon') &&
    feature.properties != null &&
    typeof feature.properties.countryId === 'string'
  )
}

export function LanguageMap({ points, unsupportedMessage }: LanguageMapProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const featureCollectionRef = useRef<CountryFeatureCollection | null>(null)
  const hoveredCountryIdRef = useRef<string | null>(null)
  const previousSelectedRef = useRef<string | null>(null)
  const previousActiveRef = useRef<string | null>(null)
  const clickTrackerRef = useRef<{ countryId: string | null; count: number }>({
    countryId: null,
    count: 0
  })

  const [countryShapes, setCountryShapes] = useState<CountryShapeFeature[] | null>(null)
  const [isUnsupported, setIsUnsupported] = useState(false)
  const [activeCountryId, setActiveCountryId] = useState<string | null>(null)
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)

  const shapeIndex = useMemo(
    () => (countryShapes != null ? createCountryShapeIndex(countryShapes) : null),
    [countryShapes]
  )

  const countries = useMemo(() => aggregateCountries(points, shapeIndex), [points, shapeIndex])
  const featureCollection = useMemo(() => createFeatureCollection(countries), [countries])

  useEffect(() => {
    let isMounted = true

    const loadShapes = async (): Promise<void> => {
      try {
        const response = await fetch('/data/countries.geojson')
        if (!response.ok) {
          throw new Error('Failed to load country shapes')
        }

        const data: CountryShapeCollection = await response.json()
        if (!isMounted) return

        if (Array.isArray(data.features)) {
          setCountryShapes(data.features)
        } else {
          setCountryShapes([])
        }
      } catch (error) {
        console.error('Failed to load country shapes', error)
        if (isMounted) {
          setCountryShapes([])
        }
      }
    }

    void loadShapes()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    featureCollectionRef.current = featureCollection
  }, [featureCollection])

  useEffect(() => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      setIsUnsupported(true)
      return
    }

    if (containerRef.current == null || mapRef.current != null) {
      return
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [10, 20],
      zoom: 1.3,
      minZoom: 1.1,
      attributionControl: true
    })

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    map.scrollZoom.disable()

    map.on('load', () => {
      const initialData = featureCollectionRef.current ?? {
        type: 'FeatureCollection',
        features: []
      }

      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: 'geojson',
          data: initialData,
          promoteId: 'featureId'
        })
      }

      if (!map.getLayer(COUNTRY_FILL_LAYER_ID)) {
        map.addLayer({
          id: COUNTRY_FILL_LAYER_ID,
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            // 'fill-color': ['get', 'fillColor'],
            //#EF3340
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              'green',
              ['boolean', ['feature-state', 'active'], false],
              '#EF3340',
              ['boolean', ['feature-state', 'hovered'], false],
              '#EF3340', // hovered
              '#643335' // default
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.5,
              ['boolean', ['feature-state', 'active'], false],
              0.2,
              ['boolean', ['feature-state', 'hovered'], false],
              0.3,
              0.0
            ]
          }
        })
      }

      // if (!map.getLayer(COUNTRY_BORDER_LAYER_ID)) {
      //   map.addLayer({
      //     id: COUNTRY_BORDER_LAYER_ID,
      //     type: 'line',
      //     source: SOURCE_ID,
      //     paint: {
      //       'line-color': '#000',
      //       'line-width': [
      //         'case',
      //         ['boolean', ['feature-state', 'selected'], false],
      //         0,
      //         ['boolean', ['feature-state', 'active'], false],
      //         0,
      //         0
      //       ],
      //       'line-opacity': 0.8
      //     }
      //   })
      // }

      // if (!map.getLayer(COUNTRY_COUNT_LAYER_ID)) {
      //   map.addLayer({
      //     id: COUNTRY_COUNT_LAYER_ID,
      //     type: 'symbol',
      //     source: SOURCE_ID,
      //     layout: {
      //       'text-field': ['get', 'labelText'],
      //       'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      //       'text-size': 14,
      //       'text-allow-overlap': true
      //     },
      //     paint: {
      //       'text-color': '#f8fafc',
      //       'text-halo-color': '#020617',
      //       'text-halo-width': 1.5
      //     }
      //   })
      // }
    })

    const setHoverState = (nextId: string | null): void => {
      const mapInstance = mapRef.current
      if (mapInstance == null) return
      const previousHover = hoveredCountryIdRef.current

      if (previousHover != null) {
        mapInstance.setFeatureState({ source: SOURCE_ID, id: previousHover }, { hovered: false })
      }

      if (nextId != null) {
        mapInstance.setFeatureState({ source: SOURCE_ID, id: nextId }, { hovered: true })
      }

      hoveredCountryIdRef.current = nextId
    }

    const handleCountryClick = (event: MapMouseEvent | MapLayerMouseEvent): void => {
      const feature = event.features?.[0]
      if (!isCountryFeature(feature)) return

      const countryId = feature.properties.countryId
      setActiveCountryId(countryId)

      const tracker = clickTrackerRef.current
      if (tracker.countryId === countryId) {
        tracker.count += 1
      } else {
        tracker.countryId = countryId
        tracker.count = 1
        setSelectedCountryId(null)
      }

      if (tracker.count >= 3) {
        setSelectedCountryId(countryId)
        tracker.count = 0
      }
    }

    map.on('mousemove', COUNTRY_FILL_LAYER_ID, (event) => {
      const feature = event.features?.[0]
      if (!isCountryFeature(feature)) return
      setHoverState(feature.properties.countryId)
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', COUNTRY_FILL_LAYER_ID, () => {
      setHoverState(null)
      map.getCanvas().style.cursor = ''
    })

    map.on('click', COUNTRY_FILL_LAYER_ID, handleCountryClick)
    map.on('click', COUNTRY_COUNT_LAYER_ID, handleCountryClick)

    map.on('mouseenter', COUNTRY_COUNT_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', COUNTRY_COUNT_LAYER_ID, () => {
      map.getCanvas().style.cursor = ''
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      hoveredCountryIdRef.current = null
      previousSelectedRef.current = null
      previousActiveRef.current = null
      clickTrackerRef.current = { countryId: null, count: 0 }
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return

    const applyActiveState = (): void => {
      const source = map.getSource(SOURCE_ID)
      if (source == null) return

      if (previousActiveRef.current != null) {
        map.setFeatureState({ source: SOURCE_ID, id: previousActiveRef.current }, { active: false })
      }

      if (activeCountryId != null) {
        map.setFeatureState({ source: SOURCE_ID, id: activeCountryId }, { active: true })
        const activeCountry = countries.find((country) => country.countryId === activeCountryId)
        if (activeCountry != null) {
          map.fitBounds(activeCountry.bounds, {
            padding: { top: 40, bottom: 40, left: 40, right: activeCountryId != null ? 360 : 40 },
            duration: 500
          })
        }
      }

      previousActiveRef.current = activeCountryId
    }

    if (!map.isStyleLoaded()) {
      void map.once('load', applyActiveState)
      return () => {
        map.off('load', applyActiveState)
      }
    }

    applyActiveState()
  }, [activeCountryId, countries])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return

    const updateSource = (): void => {
      const source = map.getSource(SOURCE_ID)
      if (source?.type === 'geojson') {
        source.setData(featureCollection)
      }
    }

    if (!map.isStyleLoaded()) {
      void map.once('load', updateSource)
      return () => {
        map.off('load', updateSource)
      }
    }

    updateSource()
  }, [featureCollection])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return

    const applySelection = (): void => {
      const source = map.getSource(SOURCE_ID)
      if (source == null) return

      if (previousSelectedRef.current != null) {
        map.setFeatureState(
          { source: SOURCE_ID, id: previousSelectedRef.current },
          { selected: false }
        )
      }

      if (selectedCountryId != null) {
        map.setFeatureState({ source: SOURCE_ID, id: selectedCountryId }, { selected: true })
      }

      previousSelectedRef.current = selectedCountryId
    }

    if (!map.isStyleLoaded()) {
      void map.once('load', applySelection)
      return () => {
        map.off('load', applySelection)
      }
    }

    applySelection()
  }, [countries, selectedCountryId])

  const activeCountry = useMemo(
    () => countries.find((country) => country.countryId === activeCountryId) ?? null,
    [countries, activeCountryId]
  )

  useEffect(() => {
    if (activeCountryId == null) return
    const stillExists = countries.some((country) => country.countryId === activeCountryId)
    if (!stillExists) {
      setActiveCountryId(null)
    }
  }, [countries, activeCountryId])

  useEffect(() => {
    if (selectedCountryId == null) return
    const stillExists = countries.some((country) => country.countryId === selectedCountryId)
    if (!stillExists) {
      setSelectedCountryId(null)
    }
  }, [countries, selectedCountryId])

  const handleCloseDetails = (): void => {
    setActiveCountryId(null)
    clickTrackerRef.current = { countryId: null, count: 0 }
  }

  const activeCountryFlag =
    activeCountry?.iso2Code != null
      ? toFlagEmoji(activeCountry.iso2Code)
      : activeCountry != null && activeCountry.countryId.length === 2
        ? toFlagEmoji(activeCountry.countryId)
        : null

  if (isUnsupported) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900/60 text-center text-sm text-slate-200/80">
        {unsupportedMessage ?? 'Map rendering is not supported in this browser.'}
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" role="presentation" aria-hidden />

      {activeCountry != null ? (
        <aside className="pointer-events-auto absolute right-16 top-1/2 h-[90%] w-[400px] max-w-full -translate-y-1/2 overflow-hidden rounded-3xl border border-stone-700/40 bg-stone-950/60 p-5 text-stone-100 shadow-2xl backdrop-blur-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-300/70">Country</p>
              <h3 className="text-lg font-semibold leading-tight">
                {activeCountryFlag != null ? (
                  <span className="mr-2 inline-block align-middle text-xl" aria-hidden>
                    {activeCountryFlag}
                  </span>
                ) : null}
                <span className="align-middle">{activeCountry.countryName}</span>
              </h3>
              <p className="mt-1 text-sm text-stone-300/80">
                {activeCountry.languages.length} language
                {activeCountry.languages.length === 1 ? '' : 's'} spoken here
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseDetails}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-700/60 bg-stone-900/60 text-stone-300 transition hover:border-stone-500 hover:text-stone-100"
              aria-label="Close country details"
            >
              ×
            </button>
          </div>

          <div className="mt-5 h-[calc(100%-4.5rem)] overflow-y-auto pr-1">
            <ul className="space-y-3 text-sm text-stone-200/90">
              {activeCountry.languages.map((language) => (
                <li key={language.id} className="rounded-xl border border-stone-800/60 bg-stone-900/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-stone-100">{language.languageName}</p>
                    <span className="text-xs text-stone-300/70">{language.speakers.toLocaleString()} speakers</span>
                  </div>
                  {language.nativeName && language.nativeName !== language.languageName ? (
                    <p className="text-xs text-stone-300/80">{language.nativeName}</p>
                  ) : null}
                  {language.englishName && language.englishName !== language.languageName ? (
                    <p className="text-xs text-stone-400/70">{language.englishName}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      ) : null}
    </div>
  )
}

