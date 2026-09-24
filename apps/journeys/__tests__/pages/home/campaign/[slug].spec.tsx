import { CombinedGraphQLErrors } from '@apollo/client'
import { render, screen } from '@testing-library/react'
import { GetServerSidePropsContext } from 'next'

import CampaignPageRoute, {
  getServerSideProps
} from '../../../../pages/home/campaign/[slug]'
import {
  makeCampaign,
  makeCampaignLinkMedia,
  mockCountryStats
} from '../../../../src/components/CampaignView/campaignFixture'
import { GET_CAMPAIGN } from '../../../../src/libs/getCampaign'

vi.mock('../../../../src/libs/getFlags', () => ({
  getFlags: vi.fn().mockResolvedValue({})
}))

const mockQuery = vi.fn()
vi.mock('../../../../src/libs/apolloClient', () => ({
  createApolloClient: () => ({ query: mockQuery })
}))

vi.mock('next-i18next/pages/serverSideTranslations', () => ({
  serverSideTranslations: vi.fn().mockResolvedValue({ _nextI18Next: {} })
}))

vi.mock('next-seo', () => ({
  NextSeo: ({
    title,
    canonical,
    openGraph
  }: {
    title?: string
    canonical?: string
    openGraph?: { images?: Array<{ url: string; alt: string }> }
  }) => (
    <div
      data-testid="NextSeoMock"
      data-title={title}
      data-canonical={canonical}
      data-og-images={JSON.stringify(openGraph?.images ?? [])}
    />
  )
}))

vi.mock('../../../../src/components/CampaignView', () => ({
  CampaignView: ({
    campaign,
    countryStats
  }: {
    campaign: { slug: string }
    countryStats: { totalVisitors: number } | null
  }) => (
    <div
      data-testid="CampaignViewMock"
      data-slug={campaign.slug}
      data-total={countryStats?.totalVisitors ?? 'none'}
    />
  )
}))

const baseContext = {
  locale: 'en',
  res: { setHeader: vi.fn() }
} as unknown as GetServerSidePropsContext

describe('campaign [slug] getServerSideProps', () => {
  const originalEnv = process.env

  beforeEach(() => {
    mockQuery.mockReset()
    process.env = {
      ...originalEnv,
      TEMPLATE_LIBRARY_EMBED_HOSTS: JSON.stringify({
        youtube: 'www.youtube.com'
      })
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns notFound for a malformed slug without calling the gateway', async () => {
    const result = await getServerSideProps({
      ...baseContext,
      params: { slug: 'BAD_SLUG!!' }
    })

    expect(mockQuery).not.toHaveBeenCalled()
    expect(result).toMatchObject({ notFound: true })
  })

  it('returns notFound when the resolver returns null and sets no-store', async () => {
    const setHeader = vi.fn()
    mockQuery.mockResolvedValueOnce({
      data: { campaignBySlug: null, campaignCountryStats: null }
    })

    const result = await getServerSideProps({
      ...baseContext,
      res: { setHeader } as unknown as GetServerSidePropsContext['res'],
      params: { slug: 'unknown' }
    })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        query: GET_CAMPAIGN,
        variables: { slug: 'unknown' },
        errorPolicy: 'all'
      })
    )
    expect(setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store, max-age=0'
    )
    expect(result).toMatchObject({ notFound: true })
  })

  it('logs a redacted summary when the null branch carries errors', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mockQuery.mockResolvedValueOnce({
      data: { campaignBySlug: null, campaignCountryStats: null },
      error: new CombinedGraphQLErrors({
        errors: [
          {
            message: 'boom',
            path: ['campaignBySlug'],
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          }
        ]
      })
    })

    await getServerSideProps({ ...baseContext, params: { slug: 'oops' } })

    expect(warn).toHaveBeenCalledWith(
      '[campaign getServerSideProps] null branch',
      expect.objectContaining({ slug: 'oops', errorCount: 1 })
    )
    warn.mockRestore()
  })

  it('returns campaign + stats props and gates off-allowlist link media', async () => {
    mockQuery.mockResolvedValueOnce({
      data: {
        campaignBySlug: makeCampaign({
          media: makeCampaignLinkMedia('https://evil.example.com/embed')
        }),
        campaignCountryStats: mockCountryStats
      }
    })

    const result = await getServerSideProps({
      ...baseContext,
      params: { slug: 'world-cup-2026' }
    })

    expect(result).toMatchObject({
      props: {
        campaign: expect.objectContaining({
          slug: 'world-cup-2026',
          media: null
        }),
        countryStats: mockCountryStats
      }
    })
  })

  it('keeps allowlisted link media', async () => {
    mockQuery.mockResolvedValueOnce({
      data: {
        campaignBySlug: makeCampaign({
          media: makeCampaignLinkMedia('https://www.youtube.com/embed/abc')
        }),
        campaignCountryStats: null
      }
    })

    const result = await getServerSideProps({
      ...baseContext,
      params: { slug: 'world-cup-2026' }
    })

    expect(result).toMatchObject({
      props: {
        campaign: expect.objectContaining({
          media: expect.objectContaining({
            embedUrl: 'https://www.youtube.com/embed/abc'
          })
        }),
        countryStats: null
      }
    })
  })

  it('still renders the page when only the stats field errored', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    mockQuery.mockResolvedValueOnce({
      data: { campaignBySlug: makeCampaign(), campaignCountryStats: null },
      error: new CombinedGraphQLErrors({
        errors: [
          {
            message: 'plausible timeout',
            path: ['campaignCountryStats'],
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
          }
        ]
      })
    })

    const result = await getServerSideProps({
      ...baseContext,
      params: { slug: 'world-cup-2026' }
    })

    expect(result).toMatchObject({
      props: {
        campaign: expect.objectContaining({ id: 'campaign-1' }),
        countryStats: null
      }
    })
    expect(warn).toHaveBeenCalledWith(
      '[campaign getServerSideProps] country stats unavailable',
      expect.objectContaining({ slug: 'world-cup-2026' })
    )
    warn.mockRestore()
  })
})

describe('CampaignPageRoute', () => {
  it('renders SEO tags and the view', () => {
    render(
      <CampaignPageRoute
        campaign={makeCampaign({
          backgroundImageSrc: 'https://example.com/bg.jpg'
        })}
        countryStats={mockCountryStats}
      />
    )

    const seo = screen.getByTestId('NextSeoMock')
    expect(seo).toHaveAttribute(
      'data-title',
      'Share the Gospel during the World Cup'
    )
    expect(seo).toHaveAttribute(
      'data-canonical',
      'https://your.nextstep.is/campaign/world-cup-2026'
    )
    expect(JSON.parse(seo.getAttribute('data-og-images') ?? '[]')).toEqual([
      {
        url: 'https://example.com/bg.jpg',
        alt: 'Share the Gospel during the World Cup'
      }
    ])
    expect(screen.getByTestId('CampaignViewMock')).toHaveAttribute(
      'data-slug',
      'world-cup-2026'
    )
    expect(screen.getByTestId('CampaignViewMock')).toHaveAttribute(
      'data-total',
      '120'
    )
  })
})
