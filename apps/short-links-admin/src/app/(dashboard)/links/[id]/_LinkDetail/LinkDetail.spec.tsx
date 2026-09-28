import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

import { GET_SHORT_LINK_STATS } from '../../../../../components/StatsPanel'
import {
  GET_SHORT_LINK_CAMPAIGN_OPTIONS,
  GET_SHORT_LINK_DOMAINS,
  lastThirtyDays
} from '../../../../../libs/shortLink'
import { GET_SHORT_LINK_ACCESS } from '../../../../../libs/useShortLinkAccess'

import { GET_SHORT_LINK, LinkDetail } from './LinkDetail'

vi.mock('next/navigation')

const push = vi.fn()
vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
  typeof useRouter
>)
vi.mocked(useParams).mockReturnValue({ id: 'link-1' })

const shortLink = {
  __typename: 'ShortLink',
  id: 'link-1',
  pathname: 'abc123',
  to: 'https://www.jesusfilm.org/watch/jesus.html',
  shortUrl: 'https://nxstp.is/abc123',
  qrUrl: 'https://nxstp.is/abc123?qr=1',
  service: 'apiMedia',
  name: 'JESUS film QR',
  description: 'Printed in the end screen',
  assetClass: 'videoEmbedded',
  status: 'active',
  redirectStatus: null,
  fallbackTo: null,
  placement: 'inVideoQr',
  language: 'en',
  tags: ['jesus'],
  videoId: '1_jf-0-0',
  youtubeVideoId: null,
  userId: 'user-1',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-02T00:00:00.000Z',
  deletedAt: null,
  edgePublishedAt: '2026-09-02T00:00:00.000Z',
  healthStatus: 'ok',
  healthCheckedAt: '2026-09-02T00:00:00.000Z',
  domain: {
    __typename: 'ShortLinkDomain',
    id: 'domain-1',
    hostname: 'nxstp.is'
  },
  campaigns: [],
  destinationHistory: [
    {
      __typename: 'ShortLinkDestinationHistory',
      id: 'history-1',
      from: 'https://www.jesusfilm.org/old',
      to: 'https://www.jesusfilm.org/watch/jesus.html',
      changedBy: 'user-1',
      changedAt: '2026-09-02T00:00:00.000Z',
      note: 'Moved to the watch page'
    }
  ]
}

function accessMock(roles: string[]) {
  return {
    request: { query: GET_SHORT_LINK_ACCESS },
    result: {
      data: {
        me: {
          __typename: 'AuthenticatedUser',
          id: 'user-1',
          mediaUserRoles: roles
        }
      }
    }
  }
}

const shortLinkMock = {
  request: { query: GET_SHORT_LINK, variables: { id: 'link-1' } },
  result: {
    data: {
      shortLink: { __typename: 'QueryShortLinkSuccess', data: shortLink }
    }
  }
}

const domainsMock = {
  request: { query: GET_SHORT_LINK_DOMAINS },
  result: {
    data: {
      shortLinkDomains: {
        __typename: 'QueryShortLinkDomainsConnection',
        edges: [
          {
            __typename: 'QueryShortLinkDomainsConnectionEdge',
            node: {
              __typename: 'ShortLinkDomain',
              id: 'domain-1',
              hostname: 'nxstp.is',
              pathPrefix: '',
              apexName: 'nxstp.is',
              services: [],
              redirectStatus: 307,
              slugAllowedChars: 'A-Za-z0-9_-',
              slugMinLength: 1,
              slugMaxLength: 64,
              slugCaseSensitive: true,
              reservedPaths: [],
              fallbackTo: null,
              notFound: 'lostPage',
              passthroughOrigin: null,
              autoFailover: false,
              edgePublishedAt: null,
              linkCount: 1
            }
          }
        ]
      }
    }
  }
}

const campaignsMock = {
  request: { query: GET_SHORT_LINK_CAMPAIGN_OPTIONS, variables: {} },
  result: {
    data: {
      shortLinkCampaigns: {
        __typename: 'QueryShortLinkCampaignsConnection',
        edges: []
      }
    }
  }
}

function statsMock() {
  return {
    request: {
      query: GET_SHORT_LINK_STATS,
      variables: {
        filter: { linkId: 'link-1', campaignId: undefined, ...lastThirtyDays() }
      }
    },
    result: {
      data: {
        shortLinkStats: {
          __typename: 'ShortLinkStats',
          total: 12,
          qr: 9,
          direct: 3,
          byDay: [
            {
              __typename: 'ShortLinkStatsPoint',
              key: '2026-09-24',
              count: 12,
              qrCount: 9
            }
          ],
          byCountry: [
            {
              __typename: 'ShortLinkStatsPoint',
              key: 'US',
              count: 12,
              qrCount: 9
            }
          ],
          byDeviceClass: [
            {
              __typename: 'ShortLinkStatsPoint',
              key: 'mobile',
              count: 12,
              qrCount: 9
            }
          ],
          byPlacement: [],
          byReferrerHost: []
        }
      }
    }
  }
}

describe('LinkDetail', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-25T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the link, its history, QR panel and stats for an admin', async () => {
    render(
      <MockedProvider
        mocks={[
          accessMock(['shortLinkAdmin']),
          shortLinkMock,
          domainsMock,
          campaignsMock,
          statsMock()
        ]}
      >
        <SnackbarProvider>
          <LinkDetail />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      await screen.findByRole('heading', { name: 'https://nxstp.is/abc123' })
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Pathname' })).toBeDisabled()
    expect(
      screen.getByRole('textbox', { name: 'Destination URL' })
    ).toHaveValue('https://www.jesusfilm.org/watch/jesus.html')
    expect(
      screen.getByRole('button', { name: 'Republish to edge' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()

    expect(screen.getByTestId('QrPanel')).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Error correction' })
    ).toHaveTextContent('H (30%)')
    expect(screen.getByRole('link', { name: 'Download PNG' })).toHaveAttribute(
      'href',
      expect.stringContaining('url=https%3A%2F%2Fnxstp.is%2Fabc123%3Fqr%3D1')
    )

    expect(screen.getByText('Moved to the watch page')).toBeInTheDocument()

    expect(await screen.findByText('US')).toBeInTheDocument()
    expect(screen.getByText('mobile')).toBeInTheDocument()
    expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeEnabled()
  })

  it('hides admin-only controls and locks the destination for an editor', async () => {
    render(
      <MockedProvider
        mocks={[
          accessMock(['shortLinkEditor']),
          shortLinkMock,
          domainsMock,
          campaignsMock,
          statsMock()
        ]}
      >
        <SnackbarProvider>
          <LinkDetail />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      await screen.findByRole('heading', { name: 'https://nxstp.is/abc123' })
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('textbox', { name: 'Destination URL' })
    ).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Republish to edge' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' })
    ).not.toBeInTheDocument()
  })
})
