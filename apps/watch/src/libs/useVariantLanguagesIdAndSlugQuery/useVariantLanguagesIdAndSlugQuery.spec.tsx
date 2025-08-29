import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GetVariantLanguagesIdAndSlug_video as Video } from '../../../__generated__/GetVariantLanguagesIdAndSlug'

import {
  GET_VARIANT_LANGUAGES_ID_AND_SLUG,
  useVariantLanguagesIdAndSlugQuery
} from './useVariantLanguagesIdAndSlugQuery'

const mockVideo: Video = {
  __typename: 'Video',
  variantLanguages: [
    {
      __typename: 'Language',
      id: 'lang1',
      slug: 'en'
    },
    {
      __typename: 'Language',
      id: 'lang2',
      slug: 'es'
    }
  ],
  subtitles: [
    {
      __typename: 'VideoSubtitle',
      languageId: 'lang1'
    },
    {
      __typename: 'VideoSubtitle',
      languageId: 'lang3'
    }
  ]
}

describe('useVariantLanguagesIdAndSlugQuery', () => {
  it('should get variant languages and subtitles for a video', async () => {
    const mockResult = jest.fn(() => ({
      data: {
        video: mockVideo
      }
    }))

    const { result } = renderHook(
      () =>
        useVariantLanguagesIdAndSlugQuery({
          variables: { id: 'videoId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_VARIANT_LANGUAGES_ID_AND_SLUG,
                  variables: {
                    id: 'videoId'
                  }
                },
                result: mockResult
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(
      async () => await waitFor(() => expect(mockResult).toHaveBeenCalled())
    )

    expect(result.current.data?.video).toEqual(mockVideo)
    expect(result.current.data?.video.variantLanguages).toHaveLength(2)
    expect(result.current.data?.video.subtitles).toHaveLength(2)
  })

  it('should handle empty variant languages and subtitles', async () => {
    const mockResult = jest.fn(() => ({
      data: {
        video: {
          __typename: 'Video',
          variantLanguages: [],
          subtitles: []
        }
      }
    }))

    const { result } = renderHook(
      () =>
        useVariantLanguagesIdAndSlugQuery({
          variables: { id: 'videoId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_VARIANT_LANGUAGES_ID_AND_SLUG,
                  variables: {
                    id: 'videoId'
                  }
                },
                result: mockResult
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(
      async () => await waitFor(() => expect(mockResult).toHaveBeenCalled())
    )

    expect(result.current.data?.video.variantLanguages).toHaveLength(0)
    expect(result.current.data?.video.subtitles).toHaveLength(0)
  })

  it('should handle loading state', () => {
    const { result } = renderHook(
      () =>
        useVariantLanguagesIdAndSlugQuery({
          variables: { id: 'videoId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_VARIANT_LANGUAGES_ID_AND_SLUG,
                  variables: {
                    id: 'videoId'
                  }
                },
                result: {
                  data: {
                    video: mockVideo
                  }
                }
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    expect(result.current.loading).toBeDefined()
  })

  it('should handle error state', async () => {
    const errorMessage = 'GraphQL error: Video not found'
    const mockError = new Error(errorMessage)

    const { result } = renderHook(
      () =>
        useVariantLanguagesIdAndSlugQuery({
          variables: { id: 'invalidId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_VARIANT_LANGUAGES_ID_AND_SLUG,
                  variables: {
                    id: 'invalidId'
                  }
                },
                error: mockError
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(
      async () =>
        await waitFor(() => expect(result.current.error).toBeDefined())
    )

    expect(result.current.error).toBeDefined()
  })
})
