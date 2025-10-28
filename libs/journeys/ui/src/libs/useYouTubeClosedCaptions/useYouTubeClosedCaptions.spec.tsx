import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { YouTubeClosedCaptionLanguages } from './__generated__/YouTubeClosedCaptionLanguages'

import {
  YOUTUBE_CLOSED_CAPTION_LANGUAGES,
  useYouTubeClosedCaptions
} from './useYouTubeClosedCaptions'

const mockLanguages = [
  {
    id: '529',
    bcp47: 'en',
    name: [
      { value: 'English', primary: true, __typename: 'LanguageName' as const }
    ],
    __typename: 'Language' as const
  },
  {
    id: '496',
    bcp47: 'es',
    name: [
      { value: 'Spanish', primary: true, __typename: 'LanguageName' as const }
    ],
    __typename: 'Language' as const
  }
]

const getYouTubeClosedCaptionsMock: MockedResponse<YouTubeClosedCaptionLanguages> =
  {
    request: {
      query: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
      variables: { videoId: 'test-video-id' }
    },
    result: {
      data: {
        youtubeClosedCaptionLanguages: {
          __typename: 'QueryYoutubeClosedCaptionLanguagesSuccess' as const,
          data: mockLanguages
        }
      }
    }
  }

describe('useYouTubeClosedCaptions', () => {
  it('fetches caption languages when videoId is provided and skip is false', async () => {
    const { result } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          skip: false
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[getYouTubeClosedCaptionsMock]}>
            {children}
          </MockedProvider>
        )
      }
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.languages).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.languages).toEqual(mockLanguages)
    expect(result.current.error).toBeUndefined()
  })

  it('does not fetch when videoId is null', async () => {
    const { result } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: null,
          skip: false
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[]}>{children}</MockedProvider>
        )
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.languages).toEqual([])
    expect(result.current.error).toBeUndefined()
  })

  it('does not fetch when skip is true', async () => {
    const { result } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          skip: true
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[]}>{children}</MockedProvider>
        )
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.languages).toEqual([])
    expect(result.current.error).toBeUndefined()
  })

  it('returns empty array when no data', async () => {
    const emptyMock: MockedResponse<YouTubeClosedCaptionLanguages> = {
      request: {
        query: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      },
      result: {
        data: {
          youtubeClosedCaptionLanguages: {
            __typename: 'QueryYoutubeClosedCaptionLanguagesSuccess' as const,
            data: []
          }
        }
      }
    }

    const { result } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          skip: false
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[emptyMock]}>{children}</MockedProvider>
        )
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.languages).toEqual([])
  })

  it('returns languages array from query response', async () => {
    const { result } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          skip: false
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[getYouTubeClosedCaptionsMock]}>
            {children}
          </MockedProvider>
        )
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.languages).toHaveLength(2)
    expect(result.current.languages[0].id).toBe('529')
    expect(result.current.languages[1].id).toBe('496')
  })

  it('uses cache-first fetch policy', async () => {
    const { result, rerender } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          skip: false
        }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[getYouTubeClosedCaptionsMock]}>
            {children}
          </MockedProvider>
        )
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.languages).toEqual(mockLanguages)

    rerender()

    expect(result.current.languages).toEqual(mockLanguages)
  })
})
