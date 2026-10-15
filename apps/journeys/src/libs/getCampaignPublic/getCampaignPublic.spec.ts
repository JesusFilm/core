import type { ApolloClient } from '@apollo/client'

import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import {
  fetchCampaignPublicInPageLanguage,
  fetchCampaignPublicInPageLanguageByHostname
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
  it('reads once when the tag names the campaign default', async () => {
    const apollo = client()
    const result = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026',
      'en'
    )
    expect(result?.campaign).toBe(campaignPublic)
    expect(result?.language).toEqual({
      languageId: '529',
      bcp47: 'en',
      source: 'param'
    })
    expect(apollo.query).toHaveBeenCalledTimes(1)
  })

  it('reads once with no tag at all, the campaign default', async () => {
    const apollo = client()
    const result = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026'
    )
    expect(result?.language).toEqual({
      languageId: '529',
      bcp47: 'en',
      source: 'default'
    })
    expect(apollo.query).toHaveBeenCalledTimes(1)
  })

  it('reads again in the named language when it is not the default', async () => {
    const apollo = client()
    const result = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026',
      'fr'
    )
    expect(result?.campaign.title).toBe('Noël 2026')
    expect(result?.language).toEqual({
      languageId: '496',
      bcp47: 'fr',
      source: 'param'
    })
    expect(apollo.query).toHaveBeenCalledTimes(2)
    expect(apollo.query.mock.calls[1][0].variables).toEqual({
      slug: 'christmas-2026',
      languageId: '496'
    })
  })

  it('reads again with the language id when the campaign default is not the fallback Watch text language', async () => {
    const inFrench = { ...french, defaultLanguageId: '496' }
    const query = vi.fn(async () => ({
      data: { campaignPublic: inFrench }
    }))
    const apollo = { query } as unknown as ApolloClient

    const result = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026'
    )

    expect(result?.language.languageId).toBe('496')
    expect(query).toHaveBeenCalledTimes(2)
    expect(query.mock.calls[1]).toEqual([
      expect.objectContaining({
        variables: { slug: 'christmas-2026', languageId: '496' }
      })
    ])
  })

  it('reads the default for a tag that is not a campaign language', async () => {
    const apollo = client()
    const result = await fetchCampaignPublicInPageLanguage(
      apollo,
      'christmas-2026',
      'de'
    )
    expect(result?.language).toEqual({
      languageId: '529',
      bcp47: 'en',
      source: 'default'
    })
  })

  it('is null for an unpublished or malformed slug', async () => {
    const apollo = client()
    apollo.query.mockResolvedValueOnce({ data: { campaignPublic: null } })
    expect(await fetchCampaignPublicInPageLanguage(apollo, 'draft')).toBeNull()
    expect(
      await fetchCampaignPublicInPageLanguage(apollo, 'Not A Slug')
    ).toBeNull()
  })
})

describe('fetchCampaignPublicInPageLanguageByHostname', () => {
  it('resolves the Page Language against the root campaign of the hostname', async () => {
    const apollo = client()
    const result = await fetchCampaignPublicInPageLanguageByHostname(
      apollo,
      'christmas.example.org',
      'fr'
    )
    expect(result?.campaign.title).toBe('Noël 2026')
    expect(result?.language).toEqual({
      languageId: '496',
      bcp47: 'fr',
      source: 'param'
    })
    expect(apollo.query.mock.calls[0][0].variables).toEqual({
      hostname: 'christmas.example.org',
      languageId: null
    })
    expect(apollo.query.mock.calls[1][0].variables).toEqual({
      hostname: 'christmas.example.org',
      languageId: '496'
    })
  })

  it('stops after the one default read when wanted rejects the root campaign', async () => {
    const apollo = client()
    const wanted = vi.fn().mockReturnValue(false)
    expect(
      await fetchCampaignPublicInPageLanguageByHostname(
        apollo,
        'christmas.example.org',
        'fr',
        wanted
      )
    ).toBeNull()
    expect(wanted).toHaveBeenCalledWith(campaignPublic)
    expect(apollo.query).toHaveBeenCalledTimes(1)
  })

  it('is null when the domain has no published root campaign', async () => {
    const apollo = client()
    apollo.query.mockResolvedValueOnce({ data: { campaignPublic: null } })
    expect(
      await fetchCampaignPublicInPageLanguageByHostname(
        apollo,
        'christmas.example.org'
      )
    ).toBeNull()
    expect(
      await fetchCampaignPublicInPageLanguageByHostname(apollo, '')
    ).toBeNull()
  })
})
