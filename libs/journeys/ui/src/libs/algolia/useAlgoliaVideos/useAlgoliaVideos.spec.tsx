import { renderHook } from '@testing-library/react'
import type { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch
} from 'react-instantsearch'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'

import {
  AlgoliaVideoItem,
  transformItems,
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
      label: 'collection',
      videoId: 'video1',
      titles: ['Video 1'],
      description: ['Description 1'],
      image: 'image1.jpg',
      duration: 120
    },
    {
      label: 'series',
      videoId: 'video2',
      titles: ['Video 2'],
      description: ['Description 2'],
      image: 'image2.jpg',
      duration: 180
    },
    {
      label: 'other',
      videoId: 'video3',
      titles: ['Video 3'],
      description: ['Description 3'],
      image: 'image3.jpg',
      duration: 240
    }
  ] as unknown as AlgoliaVideoItem[]

  const transformedItems = [
    {
      id: 'video3',
      title: 'Video 3',
      description: 'Description 3',
      image: 'image3.jpg',
      duration: 240,
      source: VideoBlockSource.internal
    }
  ]

  const filterBasedTransformedItems = [
    {
      id: 'video2',
      title: 'Video 2',
      description: 'Description 2',
      image: 'image2.jpg',
      duration: 180,
      source: VideoBlockSource.internal
    },
    {
      id: 'video3',
      title: 'Video 3',
      description: 'Description 3',
      image: 'image3.jpg',
      duration: 240,
      source: VideoBlockSource.internal
    }
  ]

  const customFilter = (item: AlgoliaVideoItem): boolean => item.duration > 150

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

  describe('transformItems', () => {
    it('should transform items correctly with default filter', () => {
      const { result } = renderHook(() => useAlgoliaVideos())
      expect(result.current.items).toEqual(transformedItems)
    })

    it('should transform items correct with custom filter', () => {
      const result = transformItems(mockAlgoliaItems, customFilter)
      expect(result).toEqual(filterBasedTransformedItems)
    })
  })

  describe('useAlgoliaVideos', () => {
    it('should return transformed items', () => {
      const { result } = renderHook(() => useAlgoliaVideos())
      expect(result.current.items).toEqual(transformedItems)
    })

    it('should apply custom filter when provided', () => {
      const { result } = renderHook(() =>
        useAlgoliaVideos({ filter: customFilter })
      )
      expect(result.current.items).toEqual(filterBasedTransformedItems)
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
  })
})
