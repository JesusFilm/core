'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import type { FeatureCollection, Point } from 'geojson'
import maplibregl, {
  Map as MapInstance,
  type MapMouseEvent,
  type MapboxGeoJSONFeature,
  Popup
} from 'maplibre-gl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { LanguageMapPoint } from '../../../libs/useLanguageMap'

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const SOURCE_ID = 'languages'
const MAX_COUNTRY_SELECTION_DISTANCE_KM = 750

type LanguageFeatureCollection = FeatureCollection<
  Point,
  {
    id: string
    languageId: string
    languageName: string
    englishName?: string
    nativeName?: string
    countryName?: string
    slug?: string
  }
>

interface LanguageMapProps {
  points: LanguageMapPoint[]
  unsupportedMessage?: string
  onCountrySelect?: (country: { id: string; name?: string } | null) => void
}

interface CountrySummary {
  id: string
  name?: string
  center: { lng: number; lat: number }
}

function createFeatureCollection(points: LanguageMapPoint[]): LanguageFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude]
      },
      properties: {
        id: point.id,
        languageId: point.languageId,
        languageName: point.languageName,
        englishName: point.englishName,
        nativeName: point.nativeName,
        countryName: point.countryName,
        slug: point.slug
      }
    }))
  }
}

function renderPopupContent({
  languageName,
  englishName,
  nativeName,
  countryName
}: {
  languageName: string
  englishName?: string
  nativeName?: string
  countryName?: string
}): HTMLElement {
  const container = document.createElement('div')
  container.className =
    'min-w-[160px] max-w-[220px] rounded-xl bg-slate-950/95 p-3 text-slate-100 shadow-lg'

  const title = document.createElement('p')
  title.className = 'text-sm font-semibold leading-tight'
  title.textContent = languageName
  container.appendChild(title)

  const nameVariants = [englishName, nativeName].filter(
    (value, index, values) => value != null && values.indexOf(value) === index
  )

  if (nameVariants.length > 0) {
    const detail = document.createElement('p')
    detail.className = 'text-xs text-slate-200/80'
    detail.textContent = nameVariants.filter(Boolean).join(' · ')
    container.appendChild(detail)
  }

  if (countryName != null) {
    const country = document.createElement('p')
    country.className = 'mt-1 text-xs text-slate-200/70'
    country.textContent = countryName
    container.appendChild(country)
  }

  return container
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function getDistanceInKm(
  pointA: { lng: number; lat: number },
  pointB: { lng: number; lat: number }
): number {
  const earthRadiusKm = 6371

  const lat1 = toRadians(pointA.lat)
  const lat2 = toRadians(pointB.lat)
  const deltaLat = toRadians(pointB.lat - pointA.lat)
  const deltaLng = toRadians(pointB.lng - pointA.lng)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

function isClusterFeature(
  feature: MapboxGeoJSONFeature | undefined
): feature is MapboxGeoJSONFeature & {
  geometry: Point
  properties: { cluster_id: number }
} {
  return (
    feature?.geometry?.type === 'Point' &&
    typeof feature.properties?.cluster_id === 'number'
  )
}

function isLanguageFeature(
  feature: MapboxGeoJSONFeature | undefined
): feature is MapboxGeoJSONFeature & {
  geometry: Point
  properties: LanguageFeatureCollection['features'][number]['properties']
} {
  return (
    feature?.geometry?.type === 'Point' &&
    feature.properties != null &&
    typeof feature.properties.languageName === 'string'
  )
}

export function LanguageMap({
  points,
  unsupportedMessage,
  onCountrySelect
}: LanguageMapProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const popupRef = useRef<Popup | null>(null)
  const clusterPopupRef = useRef<Popup | null>(null)
  const [isUnsupported, setIsUnsupported] = useState(false)

  const featureCollection = useMemo(() => createFeatureCollection(points), [points])
  const countrySummaries = useMemo<CountrySummary[]>(() => {
    const summaryMap = new Map<string, { lng: number; lat: number; count: number; name?: string }>()

    for (const point of points) {
      const existing = summaryMap.get(point.countryId)
      if (existing == null) {
        summaryMap.set(point.countryId, {
          lng: point.longitude,
          lat: point.latitude,
          count: 1,
          name: point.countryName
        })
        continue
      }

      existing.lng += point.longitude
      existing.lat += point.latitude
      existing.count += 1

      if (existing.name == null && point.countryName != null) {
        existing.name = point.countryName
      }
    }

    return Array.from(summaryMap.entries()).map(([id, summary]) => ({
      id,
      name: summary.name,
      center: {
        lng: summary.lng / summary.count,
        lat: summary.lat / summary.count
      }
    }))
  }, [points])

  const countrySummariesRef = useRef<CountrySummary[]>(countrySummaries)
  const onCountrySelectRef = useRef<
    ((country: { id: string; name?: string } | null) => void) | undefined
  >(onCountrySelect)

  useEffect(() => {
    countrySummariesRef.current = countrySummaries
  }, [countrySummaries])

  useEffect(() => {
    onCountrySelectRef.current = onCountrySelect
  }, [onCountrySelect])

  const selectCountryFromLngLat = useCallback(
    (lngLat: { lng: number; lat: number }) => {
      if (countrySummariesRef.current.length === 0) {
        onCountrySelectRef.current?.(null)
        return
      }

      let closest: CountrySummary | null = null
      let closestDistance = MAX_COUNTRY_SELECTION_DISTANCE_KM

      for (const country of countrySummariesRef.current) {
        const distance = getDistanceInKm(country.center, lngLat)
        if (distance < closestDistance) {
          closest = country
          closestDistance = distance
        }
      }

      if (closest != null) {
        onCountrySelectRef.current?.({ id: closest.id, name: closest.name })
      } else {
        onCountrySelectRef.current?.(null)
      }
    },
    []
  )

  useEffect(() => {
    // Check for WebGL support
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

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    map.addControl(new maplibregl.FullscreenControl())

    // Disable scroll zoom to prevent accidental zooming
    map.scrollZoom.disable()

    map.on('load', () => {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: featureCollection,
        cluster: true,
        clusterMaxZoom: 5,
        clusterRadius: 40,
        generateId: true
      })

      map.addLayer({
        id: 'language-clusters',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#424A66',
            10,
            '#34d399',
            30,
            '#facc15',
            75,
            '#FF9E00',
            150,
            '#F25E29',
            300,
            '#91214A'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            12,
            10,
            15,
            30,
            20,
            75,
            24,
            150,
            28,
            300,
            32
          ],
          'circle-opacity': 0.9
        }
      })

      map.addLayer({
        id: 'language-cluster-count',
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#fff'
        }
      })

      map.addLayer({
        id: 'language-point',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#22d3ee',
          'circle-radius': 5,
          'circle-stroke-width': 0
        }
      })

      map.on('click', 'language-clusters', async (event: MapMouseEvent) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['language-clusters']
        })

        const clusterFeature = features[0]
        if (!isClusterFeature(clusterFeature)) {
          return
        }

        const source = map.getSource(SOURCE_ID)
        if (source == null || source.type !== 'geojson') {
          return
        }

        map.easeTo({
          center: clusterFeature.geometry.coordinates,
          zoom: Math.min(map.getZoom() + 3, map.getMaxZoom()),
          duration: 1000
        })

        if (clusterPopupRef.current == null) {
          clusterPopupRef.current = new maplibregl.Popup({ closeButton: false, closeOnMove: false })
        }

        const pointCount = clusterFeature.properties?.point_count || 0
        const clusterId = clusterFeature.properties?.cluster_id || 0

        try {
          clusterPopupRef.current
            .setLngLat(clusterFeature.geometry.coordinates)
            .setHTML(
              `<div style="background: white; border: 1px solid black; padding: 10px; border-radius: 4px; font-family: Arial, sans-serif;"><strong>Language Cluster</strong><br/>${pointCount} languages<br/>ID: ${clusterId}</div>`
            )
            .addTo(map)
        } catch (error) {
          console.error('🗺️ Error adding cluster popup to map:', error)
        }

        selectCountryFromLngLat(event.lngLat)
      })

      map.on('click', 'language-point', (event: MapMouseEvent) => {
        const feature = event.features?.[0]
        if (!isLanguageFeature(feature)) return

        const { properties, geometry } = feature
        const coordinates = geometry.coordinates

        map.easeTo({
          center: coordinates,
          zoom: Math.min(map.getZoom() + 3, map.getMaxZoom()),
          duration: 1000
        })

        if (popupRef.current == null) {
          popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnMove: false })
        }

        popupRef.current
          .setLngLat(coordinates)
          .setDOMContent(
            renderPopupContent({
              languageName: properties.languageName,
              englishName: properties.englishName,
              nativeName: properties.nativeName,
              countryName: properties.countryName
            })
          )
          .addTo(map)

        selectCountryFromLngLat(event.lngLat)
      })

      map.on('mouseenter', 'language-clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'language-clusters', () => {
        map.getCanvas().style.cursor = ''
      })

      map.on('mouseenter', 'language-point', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'language-point', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    mapRef.current = map

    const handleGeneralClick = (event: MapMouseEvent): void => {
      selectCountryFromLngLat(event.lngLat)
    }

    map.on('click', handleGeneralClick)

    return () => {
      map.off('click', handleGeneralClick)
      map.remove()
      popupRef.current?.remove()
      clusterPopupRef.current?.remove()
      mapRef.current = null
    }
  }, [featureCollection, selectCountryFromLngLat])

  useEffect(() => {
    const map = mapRef.current
    if (map == null) return

    const updateSource = (): void => {
      const source = map.getSource(SOURCE_ID)
      if (source?.type !== 'geojson') return
      source.setData(featureCollection)
    }

    if (!map.isStyleLoaded()) {
      void map.once('load', updateSource)
      return () => {
        map.off('load', updateSource)
      }
    }

    updateSource()
  }, [featureCollection])

  if (isUnsupported) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900/60 text-center text-sm text-slate-200/80">
        {unsupportedMessage ?? 'Map rendering is not supported in this browser.'}
      </div>
    )
  }

  return <div ref={containerRef} className="h-full w-full" role="presentation" aria-hidden />
}
