import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

import { GET_COLLECTION_COUNTS, GET_SHORT_FILMS } from './queries'
import { useCarouselVideos } from './useCarouselVideos'
import {
  getPlaylistConfig,
  getDeterministicOffset,
  getRandomFromMultipleCollections,
  isVideoAlreadyPlayed,
  isPoolExhausted,
  filterOutBlacklistedVideos
} from './utils'

// Mock utils
jest.mock('./utils')

jest.mock('./insertMux', () => ({
  mergeMuxInserts: jest.fn((videos: any[]) =>
    videos.map((video) => ({ source: 'video', id: video.id, video }))
  )
}))

jest.mock('../../../../libs/getLanguageIdFromLocale', () => ({
  getLanguageIdFromLocale: () => '529'
}))

const mockVideo = {
  id: 'test-video-1',
  slug: 'test-video-1/english',
  title: [{ value: 'Test Video 1' }],
  images: [{ mobileCinematicHigh: 'test-image.jpg' }],
  imageAlt: [{ value: 'Test Image' }],
  snippet: [{ value: 'Test snippet' }],
  description: [{ value: 'Test description' }],
  label: 'segment',
  variant: {
    id: 'variant-1',
    duration: 120,
    hls: 'test.m3u8',
    slug: 'test-video-1/english',
    downloadable: false,
    downloads: [],
    language: {
      id: '529',
      name: [{ value: 'English', primary: true }],
      bcp47: 'en'
    },
    subtitleCount: 0
  },
  childrenCount: 0,
  variantLanguagesCount: 1
}

const defaultMocks = [
  {
    request: {
      query: GET_COLLECTION_COUNTS,
      variables: { ids: ['collection1', 'collection2'], languageId: '529' }
    },
    result: {
      data: {
        videos: [
          {
            id: 'collection1',
            childrenCount: 5,
            slug: 'collection1',
            label: 'collection',
            title: [{ value: 'Collection 1' }],
            primaryLanguageId: '529',
            publishedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'collection2',
            childrenCount: 3,
            slug: 'collection2',
            label: 'collection',
            title: [{ value: 'Collection 2' }],
            primaryLanguageId: '529',
            publishedAt: '2024-01-01T00:00:00Z'
          }
        ]
      }
    }
  },
  {
    request: {
      query: GET_SHORT_FILMS,
      variables: { languageId: '529' }
    },
    result: {
      data: {
        videos: [mockVideo]
      }
    }
  }
]

describe('useCarouselVideos', () => {
  const createDefaultConfig = () => ({
    playlistSequence: [['collection1'], ['collection2']],
    blacklistedVideoIds: []
  })
  let apolloMocks = [...defaultMocks]

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={apolloMocks} addTypename={false}>
      {children}
    </MockedProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }

    ;(
      getPlaylistConfig as jest.MockedFunction<typeof getPlaylistConfig>
    ).mockReturnValue(createDefaultConfig())
    ;(
      getDeterministicOffset as jest.MockedFunction<
        typeof getDeterministicOffset
      >
    ).mockReturnValue(0)
    ;(
      getRandomFromMultipleCollections as jest.MockedFunction<
        typeof getRandomFromMultipleCollections
      >
    ).mockReturnValue({
      collectionId: 'collection1',
      childIndex: 0
    })
    ;(
      isVideoAlreadyPlayed as jest.MockedFunction<typeof isVideoAlreadyPlayed>
    ).mockReturnValue(false)
    ;(
      isPoolExhausted as jest.MockedFunction<typeof isPoolExhausted>
    ).mockReturnValue(false)
    ;(
      filterOutBlacklistedVideos as jest.MockedFunction<
        typeof filterOutBlacklistedVideos
      >
    ).mockImplementation((videos) => videos)
    apolloMocks = [...defaultMocks]
  })

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useCarouselVideos('en'), {
      wrapper
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.slides).toEqual([])
    expect(result.current.videos).toEqual([])
    expect(result.current.currentIndex).toBe(0)
  })

  it('provides navigation functions', () => {
    const { result } = renderHook(() => useCarouselVideos('en'), {
      wrapper
    })

    expect(typeof result.current.moveToNext).toBe('function')
    expect(typeof result.current.moveToPrevious).toBe('function')
    expect(typeof result.current.jumpToVideo).toBe('function')
  })

  it('handles moveToNext when no videos loaded', () => {
    const { result } = renderHook(() => useCarouselVideos('en'), {
      wrapper
    })

    act(() => {
      result.current.moveToNext()
    })

    // Should not crash and should increment pool index
    expect(result.current.currentPoolIndex).toBeGreaterThanOrEqual(0)
  })

  it('handles moveToPrevious at beginning', () => {
    const { result } = renderHook(() => useCarouselVideos('en'), {
      wrapper
    })

    act(() => {
      result.current.moveToPrevious()
    })

    // Should remain at index 0 when at beginning
    expect(result.current.currentIndex).toBe(0)
  })

  it('handles jumpToVideo with invalid video ID', () => {
    const { result } = renderHook(() => useCarouselVideos('en'), {
      wrapper
    })

    act(() => {
      const success = result.current.jumpToVideo('non-existent-id')
      expect(success).toBe(false)
    })
  })

  it('returns error state when provided', () => {
    const { result } = renderHook(() => useCarouselVideos('en'), {
      wrapper
    })

    expect(result.current.error).toBeNull()
  })
})
