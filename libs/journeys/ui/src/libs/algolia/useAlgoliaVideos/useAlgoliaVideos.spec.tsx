import { renderHook } from '@testing-library/react'
import { Hit } from 'instantsearch.js'
import type { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch
} from 'react-instantsearch'

import { algoliaVideos, customTransformedItems, transformedItems } from './data'
import {
  AlgoliaVideo,
  transformItemsDefault,
  useAlgoliaVideos
} from './useAlgoliaVideos'

jest.mock('react-instantsearch')

const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as jest.MockedFunction<
  typeof useInfiniteHits
>

describe('useAlgoliaVideos', () => {
  const items = algoliaVideos.slice(0, 8)

  beforeEach(() => {
    mockUseInfiniteHits.mockReturnValue({
      items,
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    mockUseInstantSearch.mockReturnValue({
      status: 'idle',
      results: {
        __isArtificial: false,
        nbHits: items.length
      }
    } as unknown as InstantSearchApi)
  })

  describe('transformItemsDefault', () => {
    it('should transform items correctly', () => {
      const result = transformItemsDefault(items)
      expect(result).toEqual(transformedItems)
    })
  })

  describe('useAlgoliaVideos', () => {
    it('should return transformed items', () => {
      const { result } = renderHook(() => useAlgoliaVideos())
      expect(result.current.items).toEqual(transformedItems)
    })

    it('should return correct loading state', () => {
      mockUseInstantSearch.mockReturnValue({
        status: 'loading',
        results: {
          __isArtificial: false,
          nbHits: algoliaVideos.length
        }
      } as unknown as InstantSearchApi)

      const { result } = renderHook(() => useAlgoliaVideos())
      expect(result.current.loading).toBe(true)
    })

    it('should return isLastPage', () => {
      const { result } = renderHook(() => useAlgoliaVideos())
      expect(result.current.isLastPage).toBe(false)
    })

    it('should return showMore function', () => {
      const { result } = renderHook(() => useAlgoliaVideos())
      expect(result.current.showMore).toBeDefined()
    })

    it('should accept a custom transform function and return items accordingly', () => {
      const { result } = renderHook(() => useAlgoliaVideos({ transformItems }))
      expect(result.current.items).toEqual(customTransformedItems)
    })
  })
})

function transformItems<T>(items: Array<Hit<AlgoliaVideo>>): T[] {
  return items.map((item) => ({
    __typename: 'Video',
    id: item.videoId,
    label: item.label,
    title: [
      {
        value: item.titles[0]
      }
    ],
    image: item.image,
    imageAlt: [
      {
        value: item.imageAlt
      }
    ],
    snippet: [],
    slug: item.slug,
    variant: {
      id: item.objectID,
      duration: item.duration,
      hls: null,
      slug: item.slug
    },
    childrenCount: item.childrenCount
  })) as T[]
}
