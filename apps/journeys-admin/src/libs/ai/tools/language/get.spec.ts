import { MockedResponse } from '@apollo/client/testing'

import { renderHook } from '@testing-library/react'

import { ApolloLoadingProvider } from '@core/shared/ui/ApolloLoadingProvider'

import { LOAD_LANGUAGES, loadLanguages } from './get'

const mockLanguages = [
  {
    id: '529',
    slug: 'english'
  },
  {
    id: '496',
    slug: 'spanish'
  }
]

const mocks: MockedResponse[] = [
  {
    request: {
      query: LOAD_LANGUAGES,
      variables: { subtitles: ['529', '496'] }
    },
    result: {
      data: {
        languages: mockLanguages
      }
    }
  }
]

describe('loadLanguages', () => {
  it('should return language data with id and slug', async () => {
    const { result } = renderHook(
      () => ({
        client: ApolloLoadingProvider.client
      }),
      {
        wrapper: ({ children }) => (
          <ApolloLoadingProvider mocks={mocks}>
            {children}
          </ApolloLoadingProvider>
        )
      }
    )

    const tool = loadLanguages(result.current.client, { langfuseTraceId: 'test' })
    
    const response = await tool.execute({ subtitles: ['529', '496'] })
    
    expect(response).toEqual(mockLanguages)
  })

  it('should handle empty subtitles array', async () => {
    const emptyMocks: MockedResponse[] = [
      {
        request: {
          query: LOAD_LANGUAGES,
          variables: { subtitles: [] }
        },
        result: {
          data: {
            languages: []
          }
        }
      }
    ]

    const { result } = renderHook(
      () => ({
        client: ApolloLoadingProvider.client
      }),
      {
        wrapper: ({ children }) => (
          <ApolloLoadingProvider mocks={emptyMocks}>
            {children}
          </ApolloLoadingProvider>
        )
      }
    )

    const tool = loadLanguages(result.current.client, { langfuseTraceId: 'test' })
    
    const response = await tool.execute({ subtitles: [] })
    
    expect(response).toEqual([])
  })

  it('should validate language data structure', async () => {
    const invalidMocks: MockedResponse[] = [
      {
        request: {
          query: LOAD_LANGUAGES,
          variables: { subtitles: ['invalid'] }
        },
        result: {
          data: {
            languages: [
              {
                id: 'valid-id',
                // missing slug field
              }
            ]
          }
        }
      }
    ]

    const { result } = renderHook(
      () => ({
        client: ApolloLoadingProvider.client
      }),
      {
        wrapper: ({ children }) => (
          <ApolloLoadingProvider mocks={invalidMocks}>
            {children}
          </ApolloLoadingProvider>
        )
      }
    )

    const tool = loadLanguages(result.current.client, { langfuseTraceId: 'test' })
    
    await expect(tool.execute({ subtitles: ['invalid'] })).rejects.toThrow(
      'Invalid language data for ID valid-id'
    )
  })
})