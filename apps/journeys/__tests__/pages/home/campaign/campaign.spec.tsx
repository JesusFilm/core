import { CombinedGraphQLErrors } from '@apollo/client'
import { GetStaticPropsContext } from 'next'

import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { getStaticProps as getLandingStaticProps } from '../../../../pages/home/campaign/[campaignSlug]'
import { getStaticProps as getRegionStaticProps } from '../../../../pages/home/campaign/[campaignSlug]/[regionSlug]'
import { getStaticProps as getLangLandingStaticProps } from '../../../../pages/home/campaign/[campaignSlug]/_lang/[lang]'
import { getStaticProps as getLangRegionStaticProps } from '../../../../pages/home/campaign/[campaignSlug]/_lang/[lang]/[regionSlug]'

vi.mock('../../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
}))

vi.mock('../../../../src/libs/getWorldMap', () => ({
  getWorldMap: vi
    .fn()
    .mockResolvedValue({ width: 960, height: 500, countries: [] })
}))

const mockQuery = vi.fn()
vi.mock('../../../../src/libs/apolloClient', () => ({
  createApolloClient: () => ({ query: mockQuery })
}))

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

function context(params: Record<string, string>): GetStaticPropsContext {
  return {
    locale: 'en',
    params: { campaignSlug: 'christmas-2026', ...params }
  }
}

const region = campaignPublic.regions[0]
const french = { ...campaignPublic, languageId: '496', title: 'Noël' }

describe('/campaign/<slug>', () => {
  beforeEach(() => {
    mockQuery.mockReset()
  })

  it('serves the landing page in the campaign default, regenerated every 60 s', async () => {
    mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

    const result = await getLandingStaticProps(context({}))

    expect(mockQuery).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      props: expect.objectContaining({
        campaign: campaignPublic,
        region: null,
        worldMap: { width: 960, height: 500, countries: [] }
      }),
      revalidate: 60
    })
  })

  it('is not found, retrying after a second, for a draft or unknown campaign', async () => {
    mockQuery.mockRejectedValueOnce(
      new CombinedGraphQLErrors({
        errors: [{ message: 'not found', extensions: { code: 'NOT_FOUND' } }]
      } as ConstructorParameters<typeof CombinedGraphQLErrors>[0])
    )

    const result = await getLandingStaticProps(context({}))

    expect(result).toEqual(
      expect.objectContaining({ notFound: true, revalidate: 1 })
    )
  })

  it('serves a region page', async () => {
    mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

    const result = await getRegionStaticProps(
      context({ regionSlug: region.slug })
    )

    expect(result).toEqual({
      props: expect.objectContaining({ campaign: campaignPublic, region }),
      revalidate: 60
    })
  })

  it('is not found for a region the campaign does not have', async () => {
    mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

    const result = await getRegionStaticProps(
      context({ regionSlug: 'no-such-region' })
    )

    expect(result).toEqual(
      expect.objectContaining({ notFound: true, revalidate: 1 })
    )
  })

  it('skips the world map on a page without an Analytics section', async () => {
    mockQuery.mockResolvedValueOnce({
      data: {
        campaignPublic: {
          ...campaignPublic,
          pages: campaignPublic.pages.map((page) => ({
            ...page,
            blocks: page.blocks.filter(
              (block) => block.__typename !== 'CampaignAnalyticsBlock'
            )
          }))
        }
      }
    })

    const result = await getLandingStaticProps(context({}))

    expect(result).toEqual({
      props: expect.objectContaining({ worldMap: null }),
      revalidate: 60
    })
  })
})

describe('/campaign/<slug>/_lang/<tag>', () => {
  beforeEach(() => {
    mockQuery.mockReset()
  })

  it('renders the landing page in the campaign language the tag names', async () => {
    mockQuery
      .mockResolvedValueOnce({ data: { campaignPublic } })
      .mockResolvedValueOnce({ data: { campaignPublic: french } })

    const result = await getLangLandingStaticProps(context({ lang: 'fr' }))

    expect(mockQuery.mock.calls[1][0].variables).toEqual({
      slug: 'christmas-2026',
      languageId: '496'
    })
    expect(result).toEqual({
      props: expect.objectContaining({ campaign: french }),
      revalidate: 60
    })
  })

  it('renders a region page in the language', async () => {
    mockQuery
      .mockResolvedValueOnce({ data: { campaignPublic } })
      .mockResolvedValueOnce({ data: { campaignPublic: french } })

    const result = await getLangRegionStaticProps(
      context({ lang: 'fr', regionSlug: region.slug })
    )

    expect(result).toEqual({
      props: expect.objectContaining({ campaign: french, region }),
      revalidate: 60
    })
  })

  it('redirects a tag that is not a campaign language to the plain landing page', async () => {
    mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

    const result = await getLangLandingStaticProps(context({ lang: 'de' }))

    expect(result).toEqual({
      props: { languageFallback: '/campaign/christmas-2026' },
      revalidate: 60
    })
  })

  it('redirects a tag that is not a campaign language to the plain region page', async () => {
    mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

    const result = await getLangRegionStaticProps(
      context({ lang: 'de', regionSlug: region.slug })
    )

    expect(result).toEqual({
      props: { languageFallback: `/campaign/christmas-2026/${region.slug}` },
      revalidate: 60
    })
  })
})
