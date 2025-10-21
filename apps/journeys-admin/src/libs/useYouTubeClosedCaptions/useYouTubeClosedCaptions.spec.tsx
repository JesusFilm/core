import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { GetYouTubeClosedCaptionLanguageIds } from '../../../__generated__/GetYouTubeClosedCaptionLanguageIds'

import {
  GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
  useYouTubeClosedCaptions
} from './useYouTubeClosedCaptions'

const mockLanguages = [
  {
    id: 'lang-en',
    bcp47: 'en',
    name: [
      { value: 'English', primary: true, __typename: 'YouTubeLanguageName' as const }
    ],
    __typename: 'YouTubeLanguage' as const
  },
  {
    id: 'lang-es',
    bcp47: 'es',
    name: [
      { value: 'Spanish', primary: true, __typename: 'YouTubeLanguageName' as const }
    ],
    __typename: 'YouTubeLanguage' as const
  }
]

const getYouTubeClosedCaptionsMock: MockedResponse<GetYouTubeClosedCaptionLanguageIds> =
  {
    request: {
      query: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
      variables: { videoId: 'test-video-id' }
    },
    result: {
      data: {
        getYouTubeClosedCaptionLanguageIds: mockLanguages
      }
    }
  }

describe('useYouTubeClosedCaptions', () => {
  it('fetches caption languages when videoId is provided and enabled is true', async () => {
    const { result } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          enabled: true
        }),
      {
        wrapper: ({ children }: { children: ReactElement }) => (
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
          enabled: true
        }),
      {
        wrapper: ({ children }: { children: ReactElement }) => (
          <MockedProvider mocks={[]}>
            {children}
          </MockedProvider>
        )
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.languages).toEqual([])
    expect(result.current.error).toBeUndefined()
  })

  it('does not fetch when enabled is false', async () => {
    const { result } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          enabled: false
        }),
      {
        wrapper: ({ children }: { children: ReactElement }) => (
          <MockedProvider mocks={[]}>
            {children}
          </MockedProvider>
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
    const emptyMock: MockedResponse<GetYouTubeClosedCaptionLanguageIds> = {
      request: {
        query: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      },
      result: {
        data: {
          getYouTubeClosedCaptionLanguageIds: []
        }
      }
    }

    const { result } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          enabled: true
        }),
      {
        wrapper: ({ children }: { children: ReactElement }) => (
          <MockedProvider mocks={[emptyMock]}>
            {children}
          </MockedProvider>
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
          enabled: true
        }),
      {
        wrapper: ({ children }: { children: ReactElement }) => (
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
    expect(result.current.languages[0].id).toBe('lang-en')
    expect(result.current.languages[1].id).toBe('lang-es')
  })

  it('uses cache-first fetch policy', async () => {
    const { result, rerender } = renderHook(
      () =>
        useYouTubeClosedCaptions({
          videoId: 'test-video-id',
          enabled: true
        }),
      {
        wrapper: ({ children }: { children: ReactElement }) => (
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

