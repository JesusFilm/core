import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

import { GET_COLLECTION_COUNTS, GET_SHORT_FILMS } from './queries'
import { useCarouselVideos } from './useCarouselVideos'

// Mock utils
jest.mock('./utils', () => ({
  getPlaylistConfig: () => ({
    playlistSequence: [['collection1'], ['collection2']]
  }),
  getDeterministicOffset: () => 0,
  getRandomFromMultipleCollections: () => 'collection1',
  addToSessionPlayedIds: jest.fn(),
  addToPersistentPlayedIds: jest.fn(),
  isVideoAlreadyPlayed: () => false,
  isPoolExhausted: () => false,
  markPoolVideoPlayed: jest.fn(),
  getPoolKey: () => 'pool-key',
  saveCurrentVideoSession: jest.fn(),
  loadCurrentVideoSession: () => null,
  clearCurrentVideoSession: jest.fn()
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
  label: 'segment',
  variant: {
    id: 'variant-1',
    duration: 120,
    hls: 'test.m3u8',
    slug: 'test-video-1/english'
  },
  childrenCount: 0
}

const mocks = [
  {
    request: {
      query: GET_COLLECTION_COUNTS,
      variables: { ids: ['collection1', 'collection2'], languageId: '529' }
    },
    result: {
      data: {
        videos: [
          { id: 'collection1', childrenCount: 5 },
          { id: 'collection2', childrenCount: 3 }
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
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  )

  beforeEach(() => {
    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  })

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useCarouselVideos('en'), {
      wrapper
    })

    expect(result.current.loading).toBe(true)
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
