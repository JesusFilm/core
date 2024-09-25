import { renderHook } from '@testing-library/react'
import { Hit } from 'instantsearch.js'
import type { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch
} from 'react-instantsearch'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'

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
  const mockAlgoliaItems = [
    {
      videoId: 'videoId',
      titles: ['title'],
      description: ['description'],
      duration: 10994,
      languageId: '529',
      subtitles: [],
      slug: 'video-slug/english',
      label: 'featureFilm',
      image: 'image.jpg',
      imageAlt: 'Life of Jesus (Gospel of John)',
      childrenCount: 49,
      objectID: '2_529-GOJ-0-0'
    }
  ] as unknown as AlgoliaVideo[]

  const transformedItems = [
    {
      id: 'videoId',
      title: 'title',
      description: 'description',
      image: 'image.jpg',
      duration: 10994,
      source: VideoBlockSource.internal
    }
  ]

  const customTransformedItems = [
    {
      __typename: 'Video',
      childrenCount: 49,
      id: 'videoId',
      image: 'image.jpg',
      imageAlt: [
        {
          value: 'Life of Jesus (Gospel of John)'
        }
      ],
      label: 'featureFilm',
      slug: 'video-slug/english',
      snippet: [],
      title: [
        {
          value: 'title'
        }
      ],
      variant: {
        duration: 10994,
        hls: null,
        id: '2_529-GOJ-0-0',
        slug: 'video-slug/english'
      }
    }
  ]

  beforeEach(() => {
    mockUseInfiniteHits.mockReturnValue({
      items: mockAlgoliaItems,
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    mockUseInstantSearch.mockReturnValue({
      status: 'idle'
    } as unknown as InstantSearchApi)
  })

  describe('transformItemsDefault', () => {
    it('should transform items correctly with default filter', () => {
      const result = transformItemsDefault(mockAlgoliaItems)
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
        status: 'loading'
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
