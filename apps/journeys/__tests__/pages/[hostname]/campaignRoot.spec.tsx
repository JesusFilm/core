import { CombinedGraphQLErrors } from '@apollo/client'
import { GetStaticPropsContext } from 'next'

import { campaignPublic } from '@core/journeys/ui/Campaign/testData'

import { getStaticProps as getHostnameStaticProps } from '../../../pages/[hostname]'
import { getStaticProps as getSlugStaticProps } from '../../../pages/[hostname]/[journeySlug]'

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

function context(params: Record<string, string>): GetStaticPropsContext {
  return { locale: 'en', params: { hostname: HOSTNAME, ...params } }
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
  })

  describe('/', () => {
    it('serves the root campaign landing page when one is published', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getHostnameStaticProps(context({}))

      expect(mockQuery).toHaveBeenCalledTimes(1)
      expect(mockQuery.mock.calls[0][0].variables).toEqual({
        hostname: HOSTNAME,
        languageId: null
      })
      expect(result).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({ campaign: campaignPublic }),
          revalidate: 60
        })
      )
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
      expect(result).toEqual(expect.objectContaining({ notFound: true }))
    })
  })

  describe('/<segment>', () => {
    it('serves a region of the root campaign before any journey', async () => {
      mockQuery.mockResolvedValueOnce({ data: { campaignPublic } })

      const result = await getSlugStaticProps(
        context({ journeySlug: region.slug })
      )

      expect(mockQuery).toHaveBeenCalledTimes(1)
      expect(result).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({ campaign: campaignPublic, region }),
          revalidate: 60
        })
      )
    })

    it('falls through to the journey lookup when the segment is not a region', async () => {
      mockQuery
        .mockResolvedValueOnce({ data: { campaignPublic } })
        .mockResolvedValueOnce({
          data: { journey: journeyRow('my-journey') }
        })

      const result = await getSlugStaticProps(
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
})
