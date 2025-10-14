/**
 * @jest-environment node
 */
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { notFound, redirect } from 'next/navigation'

import { ResultOf, VariablesOf } from '@core/shared/gql'

import { getApolloClient } from '../../../lib/apolloClient'

import { GET_SHORT_LINK_QUERY } from './getShortLinkQuery'
import PathnamePage from './page'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn()
}))

jest.mock('../../../lib/apolloClient', () => ({
  getApolloClient: jest.fn()
}))

const mockGetApolloClient = getApolloClient as jest.MockedFunction<
  typeof getApolloClient
>

describe('PathnamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect if short link is found', async () => {
    MockLink.defaultOptions = { delay: 0 }
    const client = new ApolloClient({
      link: new MockLink([
        {
          request: {
            query: GET_SHORT_LINK_QUERY,
            variables: {
              hostname: 'short.link',
              pathname: 'test'
            } as VariablesOf<typeof GET_SHORT_LINK_QUERY>
          },
          result: {
            data: {
              __typename: 'Query',
              shortLink: {
                __typename: 'QueryShortLinkByPathSuccess',
                data: {
                  __typename: 'ShortLink',
                  to: 'https://example.com'
                }
              }
            } as ResultOf<typeof GET_SHORT_LINK_QUERY>
          }
        }
      ]),
      cache: new InMemoryCache()
    })
    mockGetApolloClient.mockReturnValue(client)
    await PathnamePage({
      params: Promise.resolve({ hostname: 'short.link', pathname: ['test'] })
    })
    expect(redirect).toHaveBeenCalledWith('https://example.com')
    expect(notFound).not.toHaveBeenCalled()
  })

  it('should return not found if short link is not found', async () => {
    MockLink.defaultOptions = { delay: 0 }
    const client = new ApolloClient({
      link: new MockLink([
        {
          request: {
            query: GET_SHORT_LINK_QUERY,
            variables: {
              hostname: 'short.link',
              pathname: 'test'
            } as VariablesOf<typeof GET_SHORT_LINK_QUERY>
          },
          result: {
            data: {
              __typename: 'Query',
              shortLink: {
                __typename: 'NotFoundError'
              }
            } as ResultOf<typeof GET_SHORT_LINK_QUERY>
          }
        }
      ]),
      cache: new InMemoryCache()
    })
    mockGetApolloClient.mockReturnValue(client)
    await PathnamePage({
      params: Promise.resolve({ hostname: 'short.link', pathname: ['test'] })
    })

    expect(notFound).toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})
