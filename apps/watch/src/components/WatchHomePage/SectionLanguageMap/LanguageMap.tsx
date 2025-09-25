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

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
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

function getCountryBounds(countryId: string, allPoints: LanguageMapPoint[]): [[number, number], [number, number]] | null {
  const countryPoints = allPoints.filter(point => point.countryId === countryId)
  if (countryPoints.length === 0) return null

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const point of countryPoints) {
    minLng = Math.min(minLng, point.longitude)
    maxLng = Math.max(maxLng, point.longitude)
    minLat = Math.min(minLat, point.latitude)
    maxLat = Math.max(maxLat, point.latitude)
  }

  // Add some padding to the bounds
  const lngPadding = (maxLng - minLng) * 0.1
  const latPadding = (maxLat - minLat) * 0.1

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding]
  ]
}

function renderCountryPopupContent({
  countryName,
  languages
}: {
  countryName: string
  languages: Array<{
    languageName: string
    englishName?: string
    nativeName?: string
  }>
}): HTMLElement {
  const container = document.createElement('div')
  container.className = 'min-w-[200px] max-w-[300px] rounded-xl bg-slate-950/95 p-4 text-slate-100 shadow-lg'

  const countryTitle = document.createElement('h3')
  countryTitle.className = 'text-base font-semibold leading-tight mb-2'
  countryTitle.textContent = countryName

  const languageCount = document.createElement('p')
  languageCount.className = 'text-sm text-slate-200/80 mb-3'
  languageCount.textContent = `${languages.length} language${languages.length !== 1 ? 's' : ''} available`

  const languageList = document.createElement('div')
  languageList.className = 'max-h-40 overflow-y-auto'

  languages.slice(0, 10).forEach(language => {
    const languageItem = document.createElement('div')
    languageItem.className = 'text-sm mb-2 last:mb-0'

    const languageName = document.createElement('span')
    languageName.className = 'font-medium text-slate-100'
    languageName.textContent = language.languageName

    languageItem.appendChild(languageName)

    if (language.nativeName && language.nativeName !== language.languageName) {
      const nativeText = document.createElement('span')
      nativeText.className = 'text-slate-200/70 ml-2'
      nativeText.textContent = `(${language.nativeName})`
      languageItem.appendChild(nativeText)
    }

    languageList.appendChild(languageItem)
  })

  if (languages.length > 10) {
    const moreText = document.createElement('p')
    moreText.className = 'text-xs text-slate-200/60 mt-2'
    moreText.textContent = `... and ${languages.length - 10} more`
    languageList.appendChild(moreText)
  }

  container.appendChild(countryTitle)
  container.appendChild(languageCount)
  container.appendChild(languageList)

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
  const clusterPopupRef = useRef<Popup | null>(null)
  const [isUnsupported, setIsUnsupported] = useState(false)

  const featureCollection = useMemo(() => createFeatureCollection(points), [points])

  useEffect(() => {
    console.log('🗺️ LanguageMap useEffect running')
    console.log('🗺️ Container ref:', containerRef.current)
    console.log('🗺️ Map ref:', mapRef.current)

    // Check for WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    console.log('🗺️ WebGL check result:', !!gl)
    if (!gl) {
      console.log('🗺️ WebGL not supported, setting unsupported')
      setIsUnsupported(true)
      return
    }

    if (containerRef.current == null || mapRef.current != null) {
      console.log('🗺️ Container or map ref check failed, returning')
      return
    }

    console.log('🗺️ Creating new map instance')
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [10, 20],
      zoom: 1.3,
      minZoom: 1.1,
      attributionControl: true
    })
    console.log('🗺️ Map instance created:', map)

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    map.addControl(new maplibregl.FullscreenControl())

    // Disable scroll zoom to prevent accidental zooming
    map.scrollZoom.disable()

    map.on('load', () => {
      console.log('🗺️ Map loaded, setting up layers and interactions')
      console.log('🗺️ Map layers before setup:', map.getStyle().layers?.map(l => l.id))

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
        console.log('🗺️ Circle clicked - Cluster')

        const features = map.queryRenderedFeatures(event.point, {
          layers: ['language-clusters']
        })

        const clusterFeature = features[0]
        console.log('🗺️ Cluster feature:', clusterFeature)
        if (!isClusterFeature(clusterFeature)) {
          console.log('🗺️ Not a cluster feature, returning')
          return
        }

        const source = map.getSource(SOURCE_ID)
        console.log('🗺️ Source:', { source, type: source?.type })
        if (source == null || source.type !== 'geojson') {
          console.log('🗺️ Source invalid, returning')
          return
        }

        // Simple zoom to cluster center
        console.log('🗺️ Zooming to cluster center')
        map.easeTo({
          center: clusterFeature.geometry.coordinates,
          zoom: Math.min(map.getZoom() + 3, map.getMaxZoom()),
          duration: 1000
        })

        // Show a simple popup with cluster info
        console.log('🗺️ Creating cluster popup')
        if (clusterPopupRef.current == null) {
          console.log('🗺️ Creating new cluster popup instance')
          clusterPopupRef.current = new maplibregl.Popup({ closeButton: false, closeOnMove: false })
        }

        const pointCount = clusterFeature.properties?.point_count || 0
        const clusterId = clusterFeature.properties?.cluster_id || 0
        const htmlContent = `<div style="color: black; padding: 8px;"><strong>Language Cluster</strong><br/>${pointCount} languages<br/>ID: ${clusterId}</div>`

        console.log('🗺️ Setting cluster popup content:', htmlContent)
        console.log('🗺️ Cluster popup coordinates:', clusterFeature.geometry.coordinates)

        try {
          clusterPopupRef.current
            .setLngLat(clusterFeature.geometry.coordinates)
            .setHTML(`<div style="background: white; border: 1px solid black; padding: 10px; border-radius: 4px; font-family: Arial, sans-serif;"><strong>Language Cluster</strong><br/>${pointCount} languages<br/>ID: ${clusterId}</div>`)
            .addTo(map)
          console.log('🗺️ Cluster popup added to map successfully')
        } catch (error) {
          console.error('🗺️ Error adding cluster popup to map:', error)
        }
      })

      map.on('click', 'language-point', (event: MapMouseEvent) => {
        console.log('🗺️ Circle clicked - Individual')

        const feature = event.features?.[0]
        if (!isLanguageFeature(feature)) return

        const { properties, geometry } = feature
        const coordinates = geometry.coordinates
        const languageName = properties.languageName as string
        const englishName = properties.englishName as string

        // Simple zoom to the point
        console.log('🗺️ Zooming to individual point')
        map.easeTo({
          center: coordinates,
          zoom: Math.min(map.getZoom() + 3, map.getMaxZoom()),
          duration: 1000
        })

        // Show a simple popup with language info
        console.log('🗺️ Creating individual point popup')
        if (popupRef.current == null) {
          console.log('🗺️ Creating new popup instance for individual point')
          popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnMove: false })
        }

        console.log('🗺️ Individual popup coordinates:', coordinates)

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
  }, [featureCollection])

  if (isUnsupported) {
    console.log('🗺️ Rendering unsupported message')
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900/60 text-center text-sm text-slate-200/80">
        {unsupportedMessage ?? 'Map rendering is not supported in this browser.'}
      </div>
    )
  }

  console.log('🗺️ Rendering map container, isUnsupported:', isUnsupported)
  return <div ref={containerRef} className="h-full w-full" role="presentation" aria-hidden />
}

