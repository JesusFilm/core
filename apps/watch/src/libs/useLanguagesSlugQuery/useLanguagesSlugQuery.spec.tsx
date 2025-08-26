import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GetLanguagesSlug_video_variantLanguagesWithSlug as VariantLanguage } from '../../../__generated__/GetLanguagesSlug'

import {
  GET_LANGUAGES_SLUG,
  useLanguagesSlugQuery
} from './useLanguagesSlugQuery'

const variantLanguages: VariantLanguage[] = [
  {
    __typename: 'LanguageWithSlug',
    slug: 'en',
    language: {
      __typename: 'Language',
      id: 'languageId1',
      slug: 'en',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        },
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: false
        }
      ]
    }
  },
  {
    __typename: 'LanguageWithSlug',
    slug: 'es',
    language: {
      __typename: 'Language',
      id: 'languageId2',
      slug: 'es',
      name: [
        {
          __typename: 'LanguageName',
          value: 'Spanish',
          primary: true
        },
        {
          __typename: 'LanguageName',
          value: 'Español',
          primary: false
        }
      ]
    }
  }
]

describe('useLanguagesSlugQuery', () => {
  it('should get languages for a video', async () => {
    const mockResult = jest.fn(() => ({
      data: {
        video: {
          variantLanguagesWithSlug: variantLanguages
        }
      }
    }))

    const { result } = renderHook(
      () =>
        useLanguagesSlugQuery({
          variables: { id: 'videoId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_LANGUAGES_SLUG,
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

    expect(result.current.data?.video?.variantLanguagesWithSlug).toEqual(
      variantLanguages
    )
  })

  it('should handle empty variant languages array', async () => {
    const mockResult = jest.fn(() => ({
      data: {
        video: {
          variantLanguagesWithSlug: []
        }
      }
    }))

    const { result } = renderHook(
      () =>
        useLanguagesSlugQuery({
          variables: { id: 'videoId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_LANGUAGES_SLUG,
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

    expect(result.current.data?.video?.variantLanguagesWithSlug).toEqual([])
  })

  it('should handle null video data', async () => {
    const mockResult = jest.fn(() => ({
      data: {
        video: null
      }
    }))

    const { result } = renderHook(
      () =>
        useLanguagesSlugQuery({
          variables: { id: 'videoId' }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_LANGUAGES_SLUG,
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

    expect(result.current.data?.video).toBeNull()
  })
})
