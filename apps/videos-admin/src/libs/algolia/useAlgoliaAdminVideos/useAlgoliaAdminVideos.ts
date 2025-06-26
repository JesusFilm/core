import { BaseHit, Hit } from 'instantsearch.js'
import { SendEventForHits } from 'instantsearch.js/es/lib/utils'
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch'

// Extended AlgoliaVideo interface with admin fields for videos-dev index
export interface AlgoliaAdminVideo extends Hit<BaseHit> {
  videoId?: string
  // Handle both array and string formats for title/description
  titles?:
    | Array<{ value: string; languageId: string; bcp47: string }>
    | string[]
  title?: Array<{ value: string; languageId: string; bcp47: string }> | string[]
  descriptions?:
    | Array<{ value: string; languageId: string; bcp47: string }>
    | string[]
  description?:
    | Array<{ value: string; languageId: string; bcp47: string }>
    | string[]
  duration?: number
  languageId?: string
  subtitles?: string[]
  slug?: string
  label?: string
  image?: string
  imageAlt?: string
  childrenCount?: number
  objectID: string
  // Admin-specific fields (these should be in videos-dev index)
  published: boolean
  locked: boolean
  // Handle different ID field names
  mediaComponentId?: string
  id?: string
  primaryLanguageId?: number
}

// Admin video interface for the DataGrid
export interface AdminVideo {
  id: string
  title?: string
  description?: string
  published: boolean
  locked: boolean
}

export function transformAlgoliaAdminVideos(
  items: AlgoliaAdminVideo[]
): AdminVideo[] {
  return items.map((video) => {
    // Flexible ID handling
    const id =
      video.mediaComponentId || video.videoId || video.id || video.objectID

    // Flexible title handling - support both array formats and string arrays
    let title: string | undefined
    if (video.titles) {
      if (Array.isArray(video.titles) && video.titles.length > 0) {
        // Handle array of objects with value property
        const firstTitle = video.titles[0]
        title =
          typeof firstTitle === 'object' && 'value' in firstTitle
            ? firstTitle.value
            : String(firstTitle)
      }
    } else if (video.title) {
      if (Array.isArray(video.title) && video.title.length > 0) {
        // Handle array of objects with value property
        const firstTitle = video.title[0]
        title =
          typeof firstTitle === 'object' && 'value' in firstTitle
            ? firstTitle.value
            : String(firstTitle)
      }
    }

    // Flexible description handling
    let description: string | undefined
    if (video.descriptions) {
      if (Array.isArray(video.descriptions) && video.descriptions.length > 0) {
        const firstDescription = video.descriptions[0]
        description =
          typeof firstDescription === 'object' && 'value' in firstDescription
            ? firstDescription.value
            : String(firstDescription)
      }
    } else if (video.description) {
      if (Array.isArray(video.description) && video.description.length > 0) {
        const firstDescription = video.description[0]
        description =
          typeof firstDescription === 'object' && 'value' in firstDescription
            ? firstDescription.value
            : String(firstDescription)
      }
    }

    return {
      id,
      title,
      description,
      published: video.published,
      locked: video.locked
    }
  })
}

interface UseAlgoliaAdminVideosOptions<T> {
  transformItems?: (items: Array<Hit<AlgoliaAdminVideo>>) => T[]
}

interface UseAlgoliaAdminVideosResult<T> {
  items: T[]
  loading: boolean
  noResults: boolean
  isLastPage: boolean
  showMore: () => void
  sendEvent: SendEventForHits
  totalCount: number
}

export function useAlgoliaAdminVideos<T = AdminVideo>(
  options?: UseAlgoliaAdminVideosOptions<T>
): UseAlgoliaAdminVideosResult<T> {
  const { transformItems = transformAlgoliaAdminVideos } = options ?? {}

  const { status, results } = useInstantSearch()
  const { items, showMore, isLastPage, sendEvent } =
    useInfiniteHits<AlgoliaAdminVideo>()

  const transformedItems = transformItems(items) as T[]

  return {
    showMore,
    sendEvent,
    isLastPage,
    items: transformedItems,
    loading: status === 'loading' || status === 'stalled',
    noResults: !(results.__isArtificial ?? false) && results.nbHits === 0,
    totalCount: results?.nbHits ?? 0
  }
}
