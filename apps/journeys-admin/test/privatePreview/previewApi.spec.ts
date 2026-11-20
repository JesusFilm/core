import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'

import { createApolloClient } from '../../src/libs/apolloClient'
import { toUser } from '../../src/libs/auth/getAuthTokens'

import handler from '../../pages/api/preview'

vi.mock('next-firebase-auth-edge', () => ({ getApiRequestTokens: vi.fn() }))
vi.mock('../../src/libs/apolloClient', () => ({ createApolloClient: vi.fn() }))
vi.mock('../../src/libs/auth/getAuthTokens', () => ({ toUser: vi.fn() }))

describe('legacy private preview locator', () => {
  const query = vi.fn()
  const redirect = vi.fn()
  const json = vi.fn()
  const status = vi.fn()
  const headers = vi.fn()
  const response = {
    redirect,
    json,
    status,
    setHeader: headers
  } as unknown as NextApiResponse
  const request = {
    method: 'GET',
    query: { slug: 'saved-draft', hostname: 'public.example' }
  } as unknown as NextApiRequest

  beforeEach(() => {
    vi.clearAllMocks()
    status.mockReturnValue(response)
    vi.mocked(getApiRequestTokens).mockResolvedValue({
      token: 'session'
    } as Awaited<ReturnType<typeof getApiRequestTokens>>)
    vi.mocked(toUser).mockReturnValue({ isAnonymous: false } as ReturnType<
      typeof toUser
    >)
    vi.mocked(createApolloClient).mockReturnValue({
      query
    } as unknown as ReturnType<typeof createApolloClient>)
    query.mockResolvedValue({ data: { adminJourney: { id: 'saved-id' } } })
  })

  it('resolves current Admin access and keeps the handoff in Admin', async () => {
    await handler(request, response)
    expect(redirect).toHaveBeenCalledWith(307, '/journeys/saved-id/preview')
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ fetchPolicy: 'no-cache' })
    )
    expect(headers).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store, max-age=0'
    )
  })

  it('denies signed-out, guest and revoked access without a public fallback', async () => {
    vi.mocked(getApiRequestTokens).mockResolvedValueOnce(null)
    await handler(request, response)
    vi.mocked(toUser).mockReturnValueOnce({ isAnonymous: true } as ReturnType<
      typeof toUser
    >)
    await handler(request, response)
    query.mockRejectedValueOnce(new Error('forbidden'))
    await handler(request, response)
    expect(status).toHaveBeenCalledTimes(3)
    expect(status).toHaveBeenLastCalledWith(403)
    expect(redirect).not.toHaveBeenCalled()
  })

  it('rejects ambiguous locators and non-read methods before data access', async () => {
    await handler(
      { ...request, query: { slug: ['a', 'b'] } } as unknown as NextApiRequest,
      response
    )
    await handler(
      { ...request, method: 'POST' } as unknown as NextApiRequest,
      response
    )
    expect(status).toHaveBeenCalledWith(400)
    expect(query).not.toHaveBeenCalled()
  })
})
