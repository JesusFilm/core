import { campaignPublic, eurRegion } from '@core/journeys/ui/Campaign/testData'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import { getStaticProps as getHostRootStaticProps } from '../../../pages/[hostname]'
import { getStaticProps as getHostSlugStaticProps } from '../../../pages/[hostname]/[journeySlug]'
import { getStaticProps as getLangHostRootStaticProps } from '../../../pages/[hostname]/_lang/[lang]'
import { getStaticProps as getLangHostSlugStaticProps } from '../../../pages/[hostname]/_lang/[lang]/[journeySlug]'
import type { CampaignReader } from '../../../src/libs/resolveCampaignPage/resolveCampaignPage'
import {
  french,
  nothingPublished,
  publishedAt,
  routeContext
} from '../campaignTestHelpers'

const mockRead = vi.fn<CampaignReader>()
vi.mock('../../../src/libs/getCampaignPublic', () => ({
  apolloCampaignReader: () => mockRead
}))

const mockQuery = vi.fn()
vi.mock('../../../src/libs/apolloClient', () => ({
  createApolloClient: () => ({ query: mockQuery })
}))

vi.mock('../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
}))

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

const HOSTNAME = 'christmas.example.org'

function context(
  params: Record<string, string> = {}
): ReturnType<typeof routeContext> {
  return routeContext({ hostname: HOSTNAME, ...params })
}

function journeyRow(slug: string): {
  id: string
  slug: string
  language: { bcp47: string }
} {
  return { id: `${slug}Id`, slug, language: { bcp47: 'en' } }
}

// The resolver spec covers the reads; these pin each route's binding and
// what a custom domain serves once the resolver answers not a campaign.
describe('custom domain', () => {
  beforeEach(() => {
    mockRead.mockReset()
    mockQuery.mockReset()
    mockRead.mockImplementation(publishedAt({ hostname: HOSTNAME }))
  })

  describe('with a published campaign', () => {
    it('serves its landing page on /, regenerated every 60 s', async () => {
      expect(await getHostRootStaticProps(context())).toEqual({
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
      expect(mockQuery).not.toHaveBeenCalled()
    })

    it('serves a region on /<segment> before any journey', async () => {
      expect(
        await getHostSlugStaticProps(context({ journeySlug: eurRegion.slug }))
      ).toEqual({
        props: expect.objectContaining({
          kind: 'page',
          pageKind: CampaignPageKind.regionTemplate,
          region: eurRegion
        }),
        revalidate: 60
      })
      expect(mockQuery).not.toHaveBeenCalled()
    })

    it('serves the landing page in the Page Language on /_lang/<tag>', async () => {
      expect(await getLangHostRootStaticProps(context({ lang: 'fr' }))).toEqual(
        {
          props: expect.objectContaining({ kind: 'page', campaign: french }),
          revalidate: 60
        }
      )
    })

    it('sends a tag that is not a campaign language to the plain region', async () => {
      expect(
        await getLangHostSlugStaticProps(
          context({ lang: 'de', journeySlug: eurRegion.slug })
        )
      ).toEqual({
        props: expect.objectContaining({
          kind: 'languageFallback',
          destination: `/${eurRegion.slug}`,
          campaignId: campaignPublic.id
        }),
        revalidate: 60
      })
    })
  })

  describe('a journey on ?lang=', () => {
    it('renders on the first response when the domain has no campaign', async () => {
      mockRead.mockImplementation(nothingPublished)
      mockQuery.mockResolvedValueOnce({
        data: { journey: journeyRow('my-journey') }
      })

      const result = await getLangHostSlugStaticProps(
        context({ lang: 'es', journeySlug: 'my-journey' })
      )

      expect(result).toEqual({
        props: expect.objectContaining({ journey: journeyRow('my-journey') }),
        revalidate: 60
      })
      expect(mockQuery.mock.calls[0][0].variables).toEqual(
        expect.objectContaining({
          id: 'my-journey',
          options: expect.objectContaining({ hostname: HOSTNAME })
        })
      )
    })

    it('renders on the first response when the segment is no region of the campaign', async () => {
      mockQuery.mockResolvedValueOnce({
        data: { journey: journeyRow('my-journey') }
      })

      const result = await getLangHostSlugStaticProps(
        context({ lang: 'fr', journeySlug: 'my-journey' })
      )

      expect(result).toEqual({
        props: expect.objectContaining({ journey: journeyRow('my-journey') }),
        revalidate: 60
      })
      expect(mockRead).toHaveBeenCalledTimes(1)
    })
  })

  describe('/ with no campaign', () => {
    beforeEach(() => {
      mockRead.mockImplementation(nothingPublished)
    })

    it('serves the only journey of the collection', async () => {
      mockQuery
        .mockResolvedValueOnce({ data: { journeys: [journeyRow('only')] } })
        .mockResolvedValueOnce({ data: { journey: journeyRow('only') } })

      const result = await getHostRootStaticProps(context())

      expect(mockQuery.mock.calls[0][0].variables).toEqual({
        options: { hostname: HOSTNAME, journeyCollection: true }
      })
      expect(result).toEqual({
        props: expect.objectContaining({
          journey: journeyRow('only'),
          journeys: []
        }),
        revalidate: 60
      })
    })

    it('serves the collection, on ?lang= too', async () => {
      const journeys = [journeyRow('first'), journeyRow('second')]
      mockQuery.mockResolvedValueOnce({ data: { journeys } })

      expect(await getLangHostRootStaticProps(context({ lang: 'es' }))).toEqual(
        {
          props: expect.objectContaining({ journeys }),
          revalidate: 60
        }
      )
    })

    it('is not found when the domain has no collection', async () => {
      mockQuery.mockResolvedValueOnce({ data: { journeys: null } })

      expect(await getHostRootStaticProps(context())).toEqual(
        expect.objectContaining({ notFound: true, revalidate: 1 })
      )
    })
  })
})
