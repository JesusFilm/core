import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'
import { type Mock } from 'vitest'

import {
  GetCampaignPagePaths,
  GetCampaignPagePaths_campaign as Campaign
} from '../../../__generated__/GetCampaignPagePaths'
import { CampaignStatus } from '../../../__generated__/globalTypes'
import { createApolloClient } from '../../../src/libs/apolloClient'

import handler, { GET_CAMPAIGN_PAGE_PATHS } from './open'

vi.mock('next-firebase-auth-edge', () => ({
  getApiRequestTokens: vi.fn()
}))

vi.mock('../../../src/libs/apolloClient', () => ({
  createApolloClient: vi.fn()
}))

const mockGetApiRequestTokens = getApiRequestTokens as unknown as Mock
const mockCreateApolloClient = createApolloClient as unknown as Mock
const mockQuery = vi.fn()
const mockFetch = vi.fn()

const JOURNEYS_URL = 'https://your.nextstep.is'
const ACCESS_TOKEN = 'revalidate-token'

const publishedCampaign: Campaign = {
  __typename: 'Campaign',
  id: 'campaignId',
  slug: 'outreach',
  status: CampaignStatus.published,
  customDomains: [
    { __typename: 'CustomDomain', id: 'domainId', name: 'outreach.example.org' }
  ],
  languages: [
    {
      __typename: 'CampaignLanguage',
      id: 'enId',
      language: { __typename: 'Language', id: '529', bcp47: 'en' }
    },
    {
      __typename: 'CampaignLanguage',
      id: 'frId',
      language: { __typename: 'Language', id: '496', bcp47: 'fr-CA' }
    },
    {
      __typename: 'CampaignLanguage',
      id: 'untaggedId',
      language: { __typename: 'Language', id: '21028', bcp47: null }
    }
  ],
  regions: [{ __typename: 'CampaignRegion', id: 'eurRegionId', slug: 'eur' }]
}

const draftCampaign: Campaign = {
  ...publishedCampaign,
  status: CampaignStatus.draft,
  customDomains: []
}

interface CapturedRes {
  res: NextApiResponse
  status: Mock
  json: Mock
  redirect: Mock
}

function mockResponse(): CapturedRes {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  const redirect = vi.fn()
  const res = { status, json, redirect } as unknown as NextApiResponse
  return { res, status, json, redirect }
}

// Default request shape: a top-level GET with Sec-Fetch-Site omitted, as a
// browser sends for a typed address. Specific tests override it.
function openReq(
  query: Record<string, string | undefined> = { id: 'campaignId' },
  overrides: { method?: string; headers?: Record<string, string> } = {}
): NextApiRequest {
  return {
    method: overrides.method ?? 'GET',
    headers: overrides.headers ?? {},
    query
  } as unknown as NextApiRequest
}

function revalidateUrl(path: string): string {
  const params = new URLSearchParams({ accessToken: ACCESS_TOKEN, path })
  return `${JOURNEYS_URL}/api/revalidate?${params.toString()}`
}

function revalidatedPaths(): string[] {
  return mockFetch.mock.calls.map(
    ([url]: [string]) => new URL(url).searchParams.get('path') ?? ''
  )
}

function mockCampaign(campaign: Campaign | undefined): void {
  const data: GetCampaignPagePaths | undefined =
    campaign == null ? undefined : { campaign }
  mockQuery.mockResolvedValue({ data })
}

describe('campaign/open', () => {
  const ORIGINAL_ENV = {
    JOURNEYS_URL: process.env.JOURNEYS_URL,
    JOURNEYS_REVALIDATE_ACCESS_TOKEN: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  }

  beforeEach(() => {
    process.env.JOURNEYS_URL = JOURNEYS_URL
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = ACCESS_TOKEN
    mockGetApiRequestTokens.mockReset()
    mockGetApiRequestTokens.mockResolvedValue({ token: 'firebase-token' })
    mockCreateApolloClient.mockReset()
    mockCreateApolloClient.mockReturnValue({ query: mockQuery })
    mockQuery.mockReset()
    mockCampaign(publishedCampaign)
    mockFetch.mockReset()
    mockFetch.mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', mockFetch)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    process.env.JOURNEYS_URL = ORIGINAL_ENV.JOURNEYS_URL
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN =
      ORIGINAL_ENV.JOURNEYS_REVALIDATE_ACCESS_TOKEN
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it.each([['POST'], ['PUT'], ['DELETE'], ['PATCH']])(
    'returns 405 for %s requests before any side effect',
    async (method) => {
      const { res, status, json, redirect } = mockResponse()
      await handler(openReq({ id: 'campaignId' }, { method }), res)
      expect(status).toHaveBeenCalledWith(405)
      expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' })
      expect(mockGetApiRequestTokens).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
      expect(redirect).not.toHaveBeenCalled()
    }
  )

  it('returns 403 when Sec-Fetch-Site is cross-site', async () => {
    const { res, status, json, redirect } = mockResponse()
    await handler(
      openReq({ id: 'campaignId' }, { headers: { 'sec-fetch-site': 'cross-site' } }),
      res
    )
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
    expect(mockFetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('allows same-origin Sec-Fetch-Site requests', async () => {
    const { res, redirect } = mockResponse()
    await handler(
      openReq({ id: 'campaignId' }, { headers: { 'sec-fetch-site': 'same-origin' } }),
      res
    )
    expect(redirect).toHaveBeenCalledWith(307, 'https://outreach.example.org')
  })

  it('returns 500 when the journeys env vars are missing', async () => {
    delete process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
    const { res, status, json, redirect } = mockResponse()
    await handler(openReq(), res)
    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: 'Missing Environment Variables' })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns 400 when the id is missing', async () => {
    const { res, status, json } = mockResponse()
    await handler(openReq({}), res)
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Missing id' })
    expect(mockGetApiRequestTokens).not.toHaveBeenCalled()
  })

  it('returns 403 without a session and reads nothing', async () => {
    mockGetApiRequestTokens.mockResolvedValueOnce(null)
    const { res, status, json, redirect } = mockResponse()
    await handler(openReq(), res)
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Not authorized' })
    expect(mockCreateApolloClient).not.toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns 403 when the session check throws', async () => {
    mockGetApiRequestTokens.mockRejectedValueOnce(new Error('boom'))
    const { res, status, json } = mockResponse()
    await handler(openReq(), res)
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Not authorized' })
  })

  it('reads the campaign as the signed-in user', async () => {
    const { res } = mockResponse()
    await handler(openReq(), res)
    expect(mockCreateApolloClient).toHaveBeenCalledWith('firebase-token')
    expect(mockQuery).toHaveBeenCalledWith({
      query: GET_CAMPAIGN_PAGE_PATHS,
      variables: { id: 'campaignId' },
      fetchPolicy: 'network-only'
    })
  })

  it('returns 404 when the campaign cannot be read', async () => {
    mockQuery.mockRejectedValueOnce(new Error('FORBIDDEN'))
    const { res, status, json, redirect } = mockResponse()
    await handler(openReq(), res)
    expect(status).toHaveBeenCalledWith(404)
    expect(json).toHaveBeenCalledWith({ error: 'Campaign not found' })
    expect(mockFetch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns 404 when the read comes back without data', async () => {
    mockCampaign(undefined)
    const { res, status } = mockResponse()
    await handler(openReq(), res)
    expect(status).toHaveBeenCalledWith(404)
  })

  it('revalidates every page of a published campaign with the access token, then redirects to the public address', async () => {
    const { res, redirect } = mockResponse()
    await handler(openReq(), res)

    expect(revalidatedPaths()).toEqual([
      '/home/campaign/outreach',
      '/home/campaign/outreach/eur',
      '/home/campaign/outreach/_lang/en',
      '/home/campaign/outreach/_lang/en/eur',
      '/home/campaign/outreach/_lang/fr-ca',
      '/home/campaign/outreach/_lang/fr-ca/eur',
      '/outreach.example.org',
      '/outreach.example.org/eur',
      '/outreach.example.org/_lang/en',
      '/outreach.example.org/_lang/en/eur',
      '/outreach.example.org/_lang/fr-ca',
      '/outreach.example.org/_lang/fr-ca/eur'
    ])
    expect(mockFetch).toHaveBeenCalledWith(
      revalidateUrl('/home/campaign/outreach')
    )
    expect(redirect).toHaveBeenCalledWith(307, 'https://outreach.example.org')
  })

  it('redirects to the permanent address when no Custom Domain names the campaign', async () => {
    mockCampaign({ ...publishedCampaign, customDomains: [] })
    const { res, redirect } = mockResponse()
    await handler(openReq(), res)

    expect(revalidatedPaths()).toHaveLength(6)
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/campaign/outreach'
    )
  })

  it('opens the region page when regionSlug names one of the campaign regions', async () => {
    const { res, redirect } = mockResponse()
    await handler(openReq({ id: 'campaignId', regionSlug: 'eur' }), res)
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://outreach.example.org/eur'
    )
  })

  it('ignores a regionSlug that is not one of the campaign regions', async () => {
    const { res, redirect } = mockResponse()
    await handler(openReq({ id: 'campaignId', regionSlug: '../evil' }), res)
    expect(redirect).toHaveBeenCalledWith(307, 'https://outreach.example.org')
  })

  it('skips the refresh for a draft campaign and redirects as before', async () => {
    mockCampaign(draftCampaign)
    const { res, redirect } = mockResponse()
    await handler(openReq({ id: 'campaignId', regionSlug: 'eur' }), res)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/campaign/outreach/eur'
    )
  })

  it('still redirects when a refresh call fails or is refused, logging it', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce({ ok: false, status: 401 })
    const { res, status, redirect } = mockResponse()
    await handler(openReq(), res)

    expect(revalidatedPaths()).toHaveLength(12)
    expect(console.error).toHaveBeenCalledTimes(2)
    expect(status).not.toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith(307, 'https://outreach.example.org')
  })
})
