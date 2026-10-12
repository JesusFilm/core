import { CombinedGraphQLErrors } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'

import { CAMPAIGN_LANGUAGE_COOKIE } from '@core/journeys/ui/Campaign'
import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { getServerSideProps as getHostnameServerSideProps } from '../../../pages/[hostname]'
import { getServerSideProps as getSlugServerSideProps } from '../../../pages/[hostname]/[journeySlug]'

vi.mock('../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
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

const setHeader = vi.fn()

interface RequestOptions {
  query?: Record<string, string>
  cookie?: string
  acceptLanguage?: string
}

function context(
  params: Record<string, string>,
  { query = {}, cookie, acceptLanguage }: RequestOptions = {}
): GetServerSidePropsContext {
  return {
    locale: 'en',
    params: { hostname: HOSTNAME, ...params },
    query,
    req: {
      cookies: cookie != null ? { [CAMPAIGN_LANGUAGE_COOKIE]: cookie } : {},
      headers:
        acceptLanguage != null ? { 'accept-language': acceptLanguage } : {}
    },
    res: { setHeader }
  } as unknown as GetServerSidePropsContext
}

function journeyRow(slug: string): {
  id: string
  slug: string
  language: { bcp47: string }
} {
  return { id: 'journeyId', slug, language: { bcp47: 'en' } }
}

const region = campaignPublic.regions[0]

describe('Campaign Root on a custom domain', () => {
  beforeEach(() => {
    mockQuery.mockReset()
    setHeader.mockReset()
  })

  describe('/', () => {
    it('serves the root campaign landing page when one is published', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getHostnameServerSideProps(context({}))

      expect(mockQuery).toHaveBeenCalledTimes(1)
      expect(mockQuery.mock.calls[0][0].variables).toEqual({
        hostname: HOSTNAME,
        languageId: null
      })
      expect(result).toEqual({
        props: expect.objectContaining({ campaign: campaignPublic })
      })
    })

    it('renders the campaign in the language named by ?lang', async () => {
      const french = { ...campaignPublic, languageId: '496', title: 'Noël' }
      mockQuery
        .mockResolvedValueOnce({ data: { campaignPublic } })
        .mockResolvedValueOnce({ data: { campaignPublic: french } })

      const result = await getHostnameServerSideProps(
        context({}, { query: { lang: 'fr' } })
      )

      expect(mockQuery.mock.calls[1][0].variables).toEqual({
        hostname: HOSTNAME,
        languageId: '496'
      })
      expect(result).toEqual({
        props: expect.objectContaining({ campaign: french })
      })
      expect(setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=300'
      )
    })

    it('renders the campaign in the language of the cookie or Accept-Language', async () => {
      const french = { ...campaignPublic, languageId: '496' }
      mockQuery.mockResolvedValue({ data: { campaignPublic } })
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic: french } })

      await getHostnameServerSideProps(context({}, { cookie: 'fr' }))
      expect(mockQuery.mock.calls[1][0].variables.languageId).toBe('496')
      expect(setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'private, no-cache'
      )

      mockQuery.mockClear()
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic: french } })
      await getHostnameServerSideProps(context({}, { acceptLanguage: 'fr' }))
      expect(mockQuery.mock.calls[1][0].variables.languageId).toBe('496')
    })

    it('falls through to the journey collection logic for a draft or missing root', async () => {
      mockQuery
        .mockRejectedValueOnce(notFoundError())
        .mockResolvedValueOnce({ data: { journeys: null } })

      const result = await getHostnameServerSideProps(context({}))

      expect(mockQuery).toHaveBeenCalledTimes(2)
      expect(mockQuery.mock.calls[1][0].variables).toEqual({
        options: { hostname: HOSTNAME, journeyCollection: true }
      })
      expect(result).toEqual(expect.objectContaining({ notFound: true }))
    })
  })

  describe('/<segment>', () => {
    it('serves a region of the root campaign before any journey', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getSlugServerSideProps(
        context({ journeySlug: region.slug })
      )

      expect(mockQuery).toHaveBeenCalledTimes(1)
      expect(result).toEqual({
        props: expect.objectContaining({ campaign: campaignPublic, region })
      })
    })

    it('renders a region in the language named by ?lang', async () => {
      const french = { ...campaignPublic, languageId: '496', title: 'Noël' }
      mockQuery
        .mockResolvedValueOnce({ data: { campaignPublic } })
        .mockResolvedValueOnce({ data: { campaignPublic: french } })

      const result = await getSlugServerSideProps(
        context({ journeySlug: region.slug }, { query: { lang: 'fr' } })
      )

      expect(mockQuery.mock.calls[1][0].variables).toEqual({
        hostname: HOSTNAME,
        languageId: '496'
      })
      expect(result).toEqual({
        props: expect.objectContaining({ campaign: french, region })
      })
    })

    it('falls through to the journey lookup when the segment is not a region', async () => {
      mockQuery
        .mockResolvedValueOnce({ data: { campaignPublic } })
        .mockResolvedValueOnce({
          data: { journey: journeyRow('my-journey') }
        })

      const result = await getSlugServerSideProps(
        context({ journeySlug: 'my-journey' })
      )

      expect(mockQuery).toHaveBeenCalledTimes(2)
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
          })
        })
      )
    })

    it('runs the journey lookup alone when the domain has no published root', async () => {
      mockQuery.mockRejectedValueOnce(notFoundError()).mockResolvedValueOnce({
        data: { journey: journeyRow(region.slug) }
      })

      const result = await getSlugServerSideProps(
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
})
