import type { ApolloClient } from '@apollo/client'

import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import {
  campaignPageCacheControl,
  fetchCampaignPublicInPageLanguage
} from './getCampaignPublic'

const french = {
  ...campaignPublic,
  languageId: '496',
  language: { __typename: 'Language' as const, id: '496', bcp47: 'fr' },
  title: 'Noël 2026'
}

function client(): { query: ReturnType<typeof vi.fn> } & ApolloClient {
  const query = vi.fn(
    async ({ variables }: { variables: { languageId: string | null } }) => ({
      data: {
        campaignPublic: variables.languageId === '496' ? french : campaignPublic
      }
    })
  )
  return { query } as unknown as {
    query: ReturnType<typeof vi.fn>
  } & ApolloClient
}

describe('fetchCampaignPublicInPageLanguage', () => {
  it('reads once when the request resolves to the campaign default', async () => {
    const apollo = client()
    const result = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026',
      {
        param: 'en',
        cookie: 'fr'
      }
    )
    expect(result?.campaign).toBe(campaignPublic)
    expect(result?.language).toEqual({
      languageId: '529',
      bcp47: 'en',
      source: 'param'
    })
    expect(apollo.query).toHaveBeenCalledTimes(1)
  })

  it('reads again in the resolved language when it is not the default', async () => {
    const apollo = client()
    const result = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026',
      {
        cookie: 'fr'
      }
    )
    expect(result?.campaign.title).toBe('Noël 2026')
    expect(result?.language).toEqual({
      languageId: '496',
      bcp47: 'fr',
      source: 'cookie'
    })
    expect(apollo.query).toHaveBeenCalledTimes(2)
    expect(apollo.query.mock.calls[1][0].variables).toEqual({
      slug: 'christmas-2026',
      languageId: '496'
    })
  })

  it('follows the ?lang → cookie → Accept-Language → default order against the campaign languages', async () => {
    const apollo = client()
    const header = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026',
      {
        param: 'de',
        cookie: 'es',
        acceptLanguage: 'fr-CA,en;q=0.5'
      }
    )
    expect(header?.language.source).toBe('acceptLanguage')
    expect(header?.campaign.languageId).toBe('496')

    const fallback = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026',
      {
        acceptLanguage: 'de'
      }
    )
    expect(fallback?.language).toEqual({
      languageId: '529',
      bcp47: 'en',
      source: 'default'
    })
  })

  it('is null for an unpublished or malformed slug', async () => {
    const apollo = client()
    apollo.query.mockResolvedValueOnce({ data: { campaignPublic: null } })
    expect(
      await fetchCampaignPublicInPageLanguage(apollo, 'draft', {})
    ).toBeNull()
    expect(
      await fetchCampaignPublicInPageLanguage(apollo, 'Not A Slug', {})
    ).toBeNull()
  })
})

describe('campaignPageCacheControl', () => {
  it('shares the cache only when the URL alone decided the language', () => {
    expect(
      campaignPageCacheControl({
        languageId: '529',
        bcp47: 'en',
        source: 'param'
      })
    ).toBe('public, s-maxage=60, stale-while-revalidate=300')
    expect(
      campaignPageCacheControl({
        languageId: '529',
        bcp47: 'en',
        source: 'default'
      })
    ).toBe('private, no-cache')
    expect(
      campaignPageCacheControl({
        languageId: '496',
        bcp47: 'fr',
        source: 'cookie'
      })
    ).toBe('private, no-cache')
    expect(
      campaignPageCacheControl({
        languageId: '496',
        bcp47: 'fr',
        source: 'acceptLanguage'
      })
    ).toBe('private, no-cache')
  })
})
