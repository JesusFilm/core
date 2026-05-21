// @vitest-environment node
import { createMockClient } from '@apollo/client/testing'
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
        } as VariablesOf<typeof GET_SHORT_LINK_QUERY>
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
        } as ResultOf<typeof GET_SHORT_LINK_QUERY>,
        GET_SHORT_LINK_QUERY,
        {
          hostname: 'short.link',
          pathname: 'test'
        } as VariablesOf<typeof GET_SHORT_LINK_QUERY>
      )
    )
    await PathnamePage({
      params: Promise.resolve({ hostname: 'short.link', pathname: ['test'] })
    })

    expect(notFound).toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})
