/**
 * @jest-environment node
 */
import { createMockClient } from '@apollo/client/testing'
import { ResultOf, VariablesOf } from 'gql.tada'
import { notFound, redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../lib/apolloClient'

import { GET_SHORT_LINK_QUERY } from './getShortLinkQuery'
import { GET } from './route'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn()
}))

jest.mock('../../lib/apolloClient', () => ({
  getApolloClient: jest.fn()
}))

const mockGetApolloClient = getApolloClient as jest.MockedFunction<
  typeof getApolloClient
>

describe('GET', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
        } as VariablesOf<typeof GET_SHORT_LINK_QUERY>
      )
    )
    const request = new NextRequest('https://short.link/test')
    await GET(request)

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
        } as ResultOf<typeof GET_SHORT_LINK_QUERY>,
        GET_SHORT_LINK_QUERY,
        {
          hostname: 'short.link',
          pathname: 'test'
        } as VariablesOf<typeof GET_SHORT_LINK_QUERY>
      )
    )
    const request = new NextRequest('https://short.link/test')
    await GET(request)

    expect(notFound).toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})
