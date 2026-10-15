import { CombinedGraphQLErrors } from '@apollo/client'
import { GetStaticPropsContext } from 'next'

import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { getStaticProps as getHostnameStaticProps } from '../../../pages/[hostname]'
import { getStaticProps as getSlugStaticProps } from '../../../pages/[hostname]/[journeySlug]'
import { getStaticProps as getLangHostnameStaticProps } from '../../../pages/[hostname]/_lang/[lang]'
import { getStaticProps as getLangSlugStaticProps } from '../../../pages/[hostname]/_lang/[lang]/[journeySlug]'

vi.mock('../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
}))

vi.mock('../../../src/libs/getWorldMap', () => ({
  getWorldMap: vi
    .fn()
    .mockResolvedValue({ width: 960, height: 500, countries: [] })
}))

const mockQuery = vi.fn()
vi.mock('../../../src/libs/apolloClient', () => ({
  createApolloClient: () => ({ query: mockQuery })
}))

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

const HOSTNAME = 'christmas.example.org'

function notFoundError(): CombinedGraphQLErrors {
  return new CombinedGraphQLErrors({
    errors: [
      { message: 'campaign not found', extensions: { code: 'NOT_FOUND' } }
    ]
  } as ConstructorParameters<typeof CombinedGraphQLErrors>[0])
}

function context(params: Record<string, string>): GetStaticPropsContext {
  return {
    locale: 'en',
    params: { hostname: HOSTNAME, ...params }
  }
}

function journeyRow(slug: string): {
  id: string
  slug: string
  language: { bcp47: string }
} {
  return { id: 'journeyId', slug, language: { bcp47: 'en' } }
}

const region = campaignPublic.regions[0]
const french = { ...campaignPublic, languageId: '496', title: 'Noël' }

describe('Campaign Root on a custom domain', () => {
  beforeEach(() => {
    mockQuery.mockReset()
  })

  describe('/', () => {
    it('serves the root campaign landing page in the campaign default, regenerated every 60 s', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getHostnameStaticProps(context({}))

      expect(mockQuery).toHaveBeenCalledTimes(1)
      expect(mockQuery.mock.calls[0][0].variables).toEqual({
        hostname: HOSTNAME,
        languageId: null
      })
      expect(result).toEqual({
        props: expect.objectContaining({
          campaign: campaignPublic,
          region: null,
          worldMap: { width: 960, height: 500, countries: [] }
        }),
        revalidate: 60
      })
    })

    it('falls through to the journey collection logic for a draft or missing root', async () => {
      mockQuery
        .mockRejectedValueOnce(notFoundError())
        .mockResolvedValueOnce({ data: { journeys: null } })

      const result = await getHostnameStaticProps(context({}))

      expect(mockQuery).toHaveBeenCalledTimes(2)
      expect(mockQuery.mock.calls[1][0].variables).toEqual({
        options: { hostname: HOSTNAME, journeyCollection: true }
      })
      expect(result).toEqual(
        expect.objectContaining({ notFound: true, revalidate: 1 })
      )
    })
  })

  describe('/_lang/<tag>', () => {
    it('renders the landing page in the campaign language the tag names', async () => {
      mockQuery
        .mockResolvedValueOnce({ data: { campaignPublic } })
        .mockResolvedValueOnce({ data: { campaignPublic: french } })

      const result = await getLangHostnameStaticProps(context({ lang: 'fr' }))

      expect(mockQuery.mock.calls[1][0].variables).toEqual({
        hostname: HOSTNAME,
        languageId: '496'
      })
      expect(result).toEqual({
        props: expect.objectContaining({ campaign: french }),
        revalidate: 60
      })
    })

    it('redirects a tag that is not a campaign language to /', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getLangHostnameStaticProps(context({ lang: 'de' }))

      expect(result).toEqual({
        props: { languageFallback: '/' },
        revalidate: 60
      })
    })

    it('redirects to / when the domain has no published root campaign', async () => {
      mockQuery.mockRejectedValueOnce(notFoundError())

      const result = await getLangHostnameStaticProps(context({ lang: 'fr' }))

      expect(result).toEqual({
        props: { languageFallback: '/' },
        revalidate: 60
      })
    })
  })

  describe('/<segment>', () => {
    it('serves a region of the root campaign before any journey', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getSlugStaticProps(
        context({ journeySlug: region.slug })
      )

      expect(mockQuery).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        props: expect.objectContaining({ campaign: campaignPublic, region }),
        revalidate: 60
      })
    })

    it('does not embed the world map on a page without an Analytics section', async () => {
      const withoutAnalytics = {
        ...campaignPublic,
        pages: campaignPublic.pages.map((page) => ({
          ...page,
          blocks: page.blocks.filter(
            (block) => block.__typename !== 'CampaignAnalyticsBlock'
          )
        }))
      }
      mockQuery.mockResolvedValueOnce({
        data: { campaignPublic: withoutAnalytics }
      })

      const result = await getSlugStaticProps(
        context({ journeySlug: region.slug })
      )

      expect(result).toEqual({
        props: expect.objectContaining({ worldMap: null }),
        revalidate: 60
      })
    })

    it('falls through to the journey lookup after one campaign read when the segment is not a region', async () => {
      mockQuery
        .mockResolvedValueOnce({ data: { campaignPublic } })
        .mockResolvedValueOnce({
          data: { journey: journeyRow('my-journey') }
        })

      const result = await getSlugStaticProps(
        context({ journeySlug: 'my-journey' })
      )

      expect(mockQuery).toHaveBeenCalledTimes(2)
      expect(mockQuery.mock.calls[0][0].variables).toEqual({
        hostname: HOSTNAME,
        languageId: null
      })
      expect(mockQuery.mock.calls[1][0].variables).toEqual(
        expect.objectContaining({
          id: 'my-journey',
          options: expect.objectContaining({ hostname: HOSTNAME })
        })
      )
      expect(result).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            journey: journeyRow('my-journey')
          }),
          revalidate: 60
        })
      )
    })

    it('runs the journey lookup alone when the domain has no published root', async () => {
      mockQuery.mockRejectedValueOnce(notFoundError()).mockResolvedValueOnce({
        data: { journey: journeyRow(region.slug) }
      })

      const result = await getSlugStaticProps(
        context({ journeySlug: region.slug })
      )

      expect(result).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            journey: journeyRow(region.slug)
          })
        })
      )
    })
  })

  describe('/_lang/<tag>/<segment>', () => {
    it('renders a region in the campaign language the tag names', async () => {
      mockQuery
        .mockResolvedValueOnce({ data: { campaignPublic } })
        .mockResolvedValueOnce({ data: { campaignPublic: french } })

      const result = await getLangSlugStaticProps(
        context({ lang: 'fr', journeySlug: region.slug })
      )

      expect(mockQuery.mock.calls[1][0].variables).toEqual({
        hostname: HOSTNAME,
        languageId: '496'
      })
      expect(result).toEqual({
        props: expect.objectContaining({ campaign: french, region }),
        revalidate: 60
      })
    })

    it('redirects a journey slug to its plain path after one read', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getLangSlugStaticProps(
        context({ lang: 'fr', journeySlug: 'my-journey' })
      )

      expect(mockQuery).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        props: { languageFallback: '/my-journey' },
        revalidate: 60
      })
    })

    it('redirects a tag that is not a campaign language to the plain region', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getLangSlugStaticProps(
        context({ lang: 'de', journeySlug: region.slug })
      )

      expect(result).toEqual({
        props: { languageFallback: `/${region.slug}` },
        revalidate: 60
      })
    })
  })
})
