'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import type { FeatureCollection, Polygon } from 'geojson'
import maplibregl, {
  Map as MapInstance,
  type LngLatBoundsLike,
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
  '#0EA5E9',
  '#22C55E',
  '#FACC15',
  '#F97316',
  '#A855F7',
  '#EC4899',
  '#38BDF8',
  '#FB7185',
  '#34D399',
  '#FBBF24'
]

interface LanguageMapProps {
  points: LanguageMapPoint[]
  unsupportedMessage?: string
}

interface CountryLanguage {
  id: string
  languageName: string
  englishName?: string
  nativeName?: string
}

interface CountryAggregation {
  countryId: string
  countryName: string
  languages: CountryLanguage[]
  bounds: LngLatBoundsLike
  feature: GeoJSONCountryFeature
}

interface CountryFeatureProperties {
  featureId: string
  countryId: string
  countryName: string
  languageCount: number
  fillColor: string
}

type GeoJSONCountryFeature = FeatureCollection<Polygon, CountryFeatureProperties>['features'][number]

type CountryFeatureCollection = FeatureCollection<Polygon, CountryFeatureProperties>

function aggregateCountries(points: LanguageMapPoint[]): CountryAggregation[] {
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
    }
  >()

  for (const point of points) {
    const existing = map.get(point.countryId)

    if (existing == null) {
      map.set(point.countryId, {
        countryId: point.countryId,
        countryName: point.countryName ?? 'Unknown country',
        minLng: point.longitude,
        maxLng: point.longitude,
        minLat: point.latitude,
        maxLat: point.latitude,
        languages: new Map([
          [
            point.languageId,
            {
              id: point.languageId,
              languageName: point.languageName,
              englishName: point.englishName,
              nativeName: point.nativeName
            }
          ]
        ])
      })
      continue
    }

    if (point.countryName && (existing.countryName === 'Unknown country' || existing.countryName === '')) {
      existing.countryName = point.countryName
    }
    existing.minLng = Math.min(existing.minLng, point.longitude)
    existing.maxLng = Math.max(existing.maxLng, point.longitude)
    existing.minLat = Math.min(existing.minLat, point.latitude)
    existing.maxLat = Math.max(existing.maxLat, point.latitude)

    if (!existing.languages.has(point.languageId)) {
      existing.languages.set(point.languageId, {
        id: point.languageId,
        languageName: point.languageName,
        englishName: point.englishName,
        nativeName: point.nativeName
      })
    }
  }

  return Array.from(map.values()).map((country, index) => {
    const lngRange = country.maxLng - country.minLng
    const latRange = country.maxLat - country.minLat
    const lngPadding = lngRange === 0 ? 0.6 : lngRange * 0.2
    const latPadding = latRange === 0 ? 0.6 : latRange * 0.2

    const west = country.minLng - lngPadding
    const east = country.maxLng + lngPadding
    const south = country.minLat - latPadding
    const north = country.maxLat + latPadding

    const polygon: Polygon = {
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

    const languages = Array.from(country.languages.values()).sort((a, b) =>
      a.languageName.localeCompare(b.languageName)
    )

    const feature: GeoJSONCountryFeature = {
      type: 'Feature',
      id: country.countryId,
      geometry: polygon,
      properties: {
        featureId: country.countryId,
        countryId: country.countryId,
        countryName: country.countryName,
        languageCount: languages.length,
        fillColor: COUNTRY_COLORS[index % COUNTRY_COLORS.length]
      }
    }

    const bounds: LngLatBoundsLike = [
      [west, south],
      [east, north]
    ]

    return {
      countryId: country.countryId,
      countryName: country.countryName,
      languages,
      bounds,
      feature
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
    feature?.geometry?.type === 'Polygon' &&
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

  const [isUnsupported, setIsUnsupported] = useState(false)
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)

  const countries = useMemo(() => aggregateCountries(points), [points])
  const featureCollection = useMemo(() => createFeatureCollection(countries), [countries])

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
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.75,
              ['boolean', ['feature-state', 'hovered'], false],
              0.6,
              0.4
            ]
          }
        })
      }

      if (!map.getLayer(COUNTRY_BORDER_LAYER_ID)) {
        map.addLayer({
          id: COUNTRY_BORDER_LAYER_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: {
            'line-color': '#e2e8f0',
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              2.5,
              1
            ],
            'line-opacity': 0.8
          }
        })
      }

      if (!map.getLayer(COUNTRY_COUNT_LAYER_ID)) {
        map.addLayer({
          id: COUNTRY_COUNT_LAYER_ID,
          type: 'symbol',
          source: SOURCE_ID,
          layout: {
            'text-field': ['to-string', ['get', 'languageCount']],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12
          },
          paint: {
            'text-color': '#0f172a',
            'text-halo-color': '#f8fafc',
            'text-halo-width': 1.5
          }
        })
      }
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
      setSelectedCountryId(feature.properties.countryId)
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
    }
  }, [])

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
      map.once('load', updateSource)
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
        const selectedCountry = countries.find((country) => country.countryId === selectedCountryId)
        if (selectedCountry != null) {
          map.fitBounds(selectedCountry.bounds, {
            padding: { top: 40, bottom: 40, left: 40, right: 360 },
            duration: 600
          })
        }
      }

      previousSelectedRef.current = selectedCountryId
    }

    if (!map.isStyleLoaded()) {
      map.once('load', applySelection)
      return () => {
        map.off('load', applySelection)
      }
    }

    applySelection()
  }, [countries, selectedCountryId])

  const selectedCountry = useMemo(
    () => countries.find((country) => country.countryId === selectedCountryId) ?? null,
    [countries, selectedCountryId]
  )

  useEffect(() => {
    if (selectedCountryId == null) return
    const stillExists = countries.some((country) => country.countryId === selectedCountryId)
    if (!stillExists) {
      setSelectedCountryId(null)
    }
  }, [countries, selectedCountryId])

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

      {selectedCountry != null ? (
        <aside className="pointer-events-auto absolute right-6 top-1/2 h-[90%] w-[300px] max-w-full -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-950/95 p-5 text-slate-100 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300/70">Country</p>
              <h3 className="text-lg font-semibold leading-tight">{selectedCountry.countryName}</h3>
              <p className="mt-1 text-sm text-slate-300/80">
                {selectedCountry.languages.length} language
                {selectedCountry.languages.length === 1 ? '' : 's'} spoken here
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCountryId(null)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/60 text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
              aria-label="Close country details"
            >
              ×
            </button>
          </div>

          <div className="mt-5 h-[calc(100%-4.5rem)] overflow-y-auto pr-1">
            <ul className="space-y-3 text-sm text-slate-200/90">
              {selectedCountry.languages.map((language) => (
                <li key={language.id} className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
                  <p className="font-medium text-slate-100">{language.languageName}</p>
                  {language.nativeName && language.nativeName !== language.languageName ? (
                    <p className="text-xs text-slate-300/80">{language.nativeName}</p>
                  ) : null}
                  {language.englishName && language.englishName !== language.languageName ? (
                    <p className="text-xs text-slate-400/70">{language.englishName}</p>
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

