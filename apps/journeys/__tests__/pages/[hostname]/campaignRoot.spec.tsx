import { CombinedGraphQLErrors } from '@apollo/client'
import { GetStaticPropsContext } from 'next'

import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { getStaticProps as getHostnameStaticProps } from '../../../pages/[hostname]'
import { getStaticProps as getSlugStaticProps } from '../../../pages/[hostname]/[journeySlug]'
import { getStaticProps as getLangHostnameStaticProps } from '../../../pages/[hostname]/_lang/[lang]'
import { getStaticProps as getLangSlugStaticProps } from '../../../pages/[hostname]/_lang/[lang]/[journeySlug]'
import { logger } from '../../../src/libs/logger'

vi.mock('../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
}))

vi.mock('../../../src/libs/logger', () => ({
  logger: { error: vi.fn() }
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

function validationError(): CombinedGraphQLErrors {
  return new CombinedGraphQLErrors({
    errors: [
      {
        message: 'Cannot query field "campaignPublic"',
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED' }
      }
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

describe('Campaign Domain', () => {
  beforeEach(() => {
    mockQuery.mockReset()
    vi.mocked(logger.error).mockClear()
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
          region: null
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

  describe.each([
    ['a gateway validation error', validationError],
    ['a network failure', () => new Error('socket hang up')]
  ])('when the Campaign Domain read fails with %s', (_name, failure) => {
    it('serves the journey collection logic on /', async () => {
      mockQuery
        .mockRejectedValueOnce(failure())
        .mockResolvedValueOnce({ data: { journeys: null } })

      const result = await getHostnameStaticProps(context({}))

      expect(mockQuery.mock.calls[1][0].variables).toEqual({
        options: { hostname: HOSTNAME, journeyCollection: true }
      })
      expect(result).toEqual(
        expect.objectContaining({ notFound: true, revalidate: 1 })
      )
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ hostname: HOSTNAME, err: expect.any(Error) }),
        'campaign root read failed'
      )
    })

    it('serves the journey on /<segment>', async () => {
      mockQuery.mockRejectedValueOnce(failure()).mockResolvedValueOnce({
        data: { journey: journeyRow('my-journey') }
      })

      const result = await getSlugStaticProps(
        context({ journeySlug: 'my-journey' })
      )

      expect(result).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            journey: journeyRow('my-journey')
          })
        })
      )
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ hostname: HOSTNAME, err: expect.any(Error) }),
        'campaign root read failed'
      )
    })

    it('redirects /_lang/<tag> to /', async () => {
      mockQuery.mockRejectedValueOnce(failure())

      const result = await getLangHostnameStaticProps(context({ lang: 'fr' }))

      expect(result).toEqual({
        props: { languageFallback: '/' },
        revalidate: 60
      })
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ hostname: HOSTNAME, err: expect.any(Error) }),
        'campaign root read failed'
      )
    })

    it('redirects /_lang/<tag>/<segment> to the plain path', async () => {
      mockQuery.mockRejectedValueOnce(failure())

      const result = await getLangSlugStaticProps(
        context({ lang: 'fr', journeySlug: 'my-journey' })
      )

      expect(result).toEqual({
        props: { languageFallback: '/my-journey' },
        revalidate: 60
      })
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ hostname: HOSTNAME, err: expect.any(Error) }),
        'campaign root read failed'
      )
    })
  })
})
