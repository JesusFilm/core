import { campaignPublic, eurRegion } from '@core/journeys/ui/Campaign/testData'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { getStaticProps as getLandingStaticProps } from '../../../../pages/home/campaign/[campaignSlug]'
import { getStaticProps as getRegionStaticProps } from '../../../../pages/home/campaign/[campaignSlug]/[regionSlug]'
import { getStaticProps as getLangLandingStaticProps } from '../../../../pages/home/campaign/[campaignSlug]/_lang/[lang]'
import { getStaticProps as getLangRegionStaticProps } from '../../../../pages/home/campaign/[campaignSlug]/_lang/[lang]/[regionSlug]'
import type { CampaignReader } from '../../../../src/libs/resolveCampaignPage/resolveCampaignPage'
import {
  french,
  nothingPublished,
  publishedAt,
  routeContext
} from '../../campaignTestHelpers'

const mockRead = vi.fn<CampaignReader>()
vi.mock('../../../../src/libs/getCampaignPublic', () => ({
  apolloCampaignReader: () => mockRead
}))

vi.mock('../../../../src/libs/apolloClient', () => ({
  createApolloClient: vi.fn()
}))

vi.mock('../../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
}))

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

const SLUG = campaignPublic.slug

function context(
  params: Record<string, string> = {}
): ReturnType<typeof routeContext> {
  return routeContext({ campaignSlug: SLUG, ...params })
}

// The resolver spec covers the reads; these pin each route's binding.
describe('/campaign/<slug>', () => {
  beforeEach(() => {
    mockRead.mockReset()
    mockRead.mockImplementation(publishedAt({ slug: SLUG }))
  })

  it('serves the landing page with the flags and translations, regenerated every 60 s', async () => {
    expect(await getLandingStaticProps(context())).toEqual({
      props: {
        flags: {},
        _nextI18Next: {},
        kind: 'page',
        campaign: campaignPublic,
        pageKind: CampaignPageKind.landing,
        region: null
      },
      revalidate: 60
    })
  })

  it('serves a region page', async () => {
    expect(
      await getRegionStaticProps(context({ regionSlug: eurRegion.slug }))
    ).toEqual({
      props: expect.objectContaining({
        kind: 'page',
        pageKind: CampaignPageKind.regionTemplate,
        region: eurRegion
      }),
      revalidate: 60
    })
  })

  it('serves the landing page in the Page Language the tag names', async () => {
    expect(await getLangLandingStaticProps(context({ lang: 'fr' }))).toEqual({
      props: expect.objectContaining({ kind: 'page', campaign: french }),
      revalidate: 60
    })
  })

  it('sends a tag that is not a campaign language to the plain region page', async () => {
    expect(
      await getLangRegionStaticProps(
        context({ lang: 'de', regionSlug: eurRegion.slug })
      )
    ).toEqual({
      props: expect.objectContaining({
        kind: 'languageFallback',
        destination: `/campaign/${SLUG}/${eurRegion.slug}`,
        campaignId: campaignPublic.id
      }),
      revalidate: 60
    })
  })

  it('is not found, retrying after a second, for a draft or unknown campaign', async () => {
    mockRead.mockImplementation(nothingPublished)

    expect(await getLandingStaticProps(context())).toEqual({
      notFound: true,
      revalidate: 1
    })
  })

  it('throws a failed read, so ISR keeps the last good page', async () => {
    mockRead.mockRejectedValue(new Error('socket hang up'))

    await expect(getLandingStaticProps(context())).rejects.toThrow(
      'socket hang up'
    )
  })
})
