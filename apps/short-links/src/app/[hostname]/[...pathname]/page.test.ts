// @vitest-environment node

import { ApolloClient, InMemoryCache, TypedDocumentNode } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { notFound, redirect } from 'next/navigation'
import type { MockedFunction } from 'vitest'

import { ResultOf, VariablesOf } from '@core/shared/gql'

import { getApolloClient } from '../../../lib/apolloClient'

import { GET_SHORT_LINK_QUERY } from './getShortLinkQuery'
import PathnamePage from './page'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn()
}))

vi.mock('../../../lib/apolloClient', () => ({
  getApolloClient: vi.fn()
}))

const mockGetApolloClient = getApolloClient as MockedFunction<
  typeof getApolloClient
>

// Stands in for Apollo Client 3's `createMockClient`, removed in v4: a client
// whose link answers exactly one request with `data`.
function createMockClient<
  TData extends Record<string, unknown>,
  TVariables extends Record<string, unknown>
>(
  data: TData,
  query: TypedDocumentNode<TData, TVariables>,
  variables: TVariables
): ApolloClient {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink([{ request: { query, variables }, result: { data } }])
  })
}

describe('PathnamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect if short link is found', async () => {
    mockGetApolloClient.mockReturnValue(
      createMockClient(
        {
          __typename: 'Query',
          shortLink: {
            __typename: 'QueryShortLinkByPathSuccess',
            data: {
              __typename: 'ShortLink',
              to: 'https://example.com'
            }
          }
        } as ResultOf<typeof GET_SHORT_LINK_QUERY>,
        GET_SHORT_LINK_QUERY,
        {
          hostname: 'short.link',
          pathname: 'test'
        }
      )
    )
    await PathnamePage({
      params: Promise.resolve({ hostname: 'short.link', pathname: ['test'] })
    })
    expect(redirect).toHaveBeenCalledWith('https://example.com')
    expect(notFound).not.toHaveBeenCalled()
  })

  it('should return not found if short link is not found', async () => {
    mockGetApolloClient.mockReturnValue(
      createMockClient(
        {
          shortLink: {
            __typename: 'NotFoundError'
          }
        },
        GET_SHORT_LINK_QUERY,
        {
          hostname: 'short.link',
          pathname: 'test'
        }
      )
    )
    await PathnamePage({
      params: Promise.resolve({ hostname: 'short.link', pathname: ['test'] })
    })

    expect(notFound).toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})
