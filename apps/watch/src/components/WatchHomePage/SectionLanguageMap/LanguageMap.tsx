'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import type { FeatureCollection, Point } from 'geojson'
import maplibregl, {
  Map as MapInstance,
  type MapMouseEvent,
  type MapboxGeoJSONFeature,
  Popup
} from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { LanguageMapPoint } from '../../../libs/useLanguageMap'

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const SOURCE_ID = 'languages'

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
  unsupportedMessage
}: LanguageMapProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const popupRef = useRef<Popup | null>(null)
  const [isUnsupported, setIsUnsupported] = useState(false)

  const featureCollection = useMemo(() => createFeatureCollection(points), [points])
  const initialDataRef = useRef<LanguageFeatureCollection | null>(null)
  if (initialDataRef.current == null) initialDataRef.current = featureCollection

  useEffect(() => {
    if (!maplibregl.supported()) {
      setIsUnsupported(true)
      return
    }

    if (containerRef.current == null || mapRef.current != null) return

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

    map.on('load', () => {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: initialDataRef.current ?? featureCollection,
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
            '#38bdf8',
            10,
            '#34d399',
            30,
            '#facc15',
            75,
            '#fb923c',
            150,
            '#f97316',
            300,
            '#ef4444'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            16,
            10,
            20,
            30,
            26,
            75,
            32,
            150,
            38,
            300,
            44
          ],
          'circle-opacity': 0.9,
          'circle-stroke-color': '#0f172a',
          'circle-stroke-width': 1.5
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
          'text-color': '#0f172a'
        }
      })

      map.addLayer({
        id: 'language-point',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#22d3ee',
          'circle-radius': 6,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#0f172a'
        }
      })

      map.on('click', 'language-clusters', async (event: MapMouseEvent) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['language-clusters']
        })

        const clusterFeature = features[0]
        const source = map.getSource(SOURCE_ID)
        if (source == null || source.type !== 'geojson' || !isClusterFeature(clusterFeature))
          return

        void source.getClusterExpansionZoom(
          clusterFeature.properties.cluster_id,
          (error, zoom) => {
            if (error != null) return
            map.easeTo({
              center: clusterFeature.geometry.coordinates,
              zoom
            })
          }
        )
      })

      map.on('click', 'language-point', (event: MapMouseEvent) => {
        const feature = event.features?.[0]
        if (!isLanguageFeature(feature)) return

        const { properties, geometry } = feature
        const coordinates = geometry.coordinates

        if (popupRef.current == null) {
          popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnMove: true })
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

    return () => {
      map.remove()
      popupRef.current?.remove()
      mapRef.current = null
    }
  }, [])

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

    return undefined
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

export default LanguageMap
