import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

import {
  GET_SHORT_LINK_CAMPAIGN_OPTIONS,
  GET_SHORT_LINK_DOMAINS
} from '../../../../libs/shortLink'

import { GET_SHORT_LINKS, LinkList } from './LinkList'

vi.mock('next/navigation')

const push = vi.fn()
vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
  typeof useRouter
>)

const shortLink = {
  __typename: 'ShortLink',
  id: 'link-1',
  pathname: 'abc123',
  to: 'https://www.jesusfilm.org/watch/jesus.html',
  shortUrl: 'https://nxstp.is/abc123',
  qrUrl: 'https://nxstp.is/abc123?qr=1',
  service: 'apiMedia',
  name: 'JESUS film QR',
  description: null,
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
  campaigns: [
    { __typename: 'ShortLinkCampaign', id: 'campaign-1', name: 'Autumn launch' }
  ]
}

const emptyFilter = {
  search: undefined,
  hostname: undefined,
  status: undefined,
  assetClass: undefined,
  placement: undefined,
  campaignId: undefined,
  tag: undefined
}

const shortLinksMock = {
  request: {
    query: GET_SHORT_LINKS,
    variables: { filter: emptyFilter, first: 25, after: undefined }
  },
  result: {
    data: {
      shortLinks: {
        __typename: 'QueryShortLinksConnection',
        totalCount: 1,
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage: false,
          endCursor: 'cursor-1'
        },
        edges: [
          {
            __typename: 'QueryShortLinksConnectionEdge',
            cursor: 'cursor-1',
            node: shortLink
          }
        ]
      }
    }
  }
}

const pausedLinksMock = {
  request: {
    query: GET_SHORT_LINKS,
    variables: {
      filter: { ...emptyFilter, status: 'paused' },
      first: 25,
      after: undefined
    }
  },
  result: {
    data: {
      shortLinks: {
        __typename: 'QueryShortLinksConnection',
        totalCount: 0,
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage: false,
          endCursor: null
        },
        edges: []
      }
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

describe('LinkList', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('renders links from the connection', async () => {
    render(
      <MockedProvider mocks={[shortLinksMock, domainsMock, campaignsMock]}>
        <SnackbarProvider>
          <LinkList />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      await screen.findByText('https://nxstp.is/abc123')
    ).toBeInTheDocument()
    expect(screen.getByText('JESUS film QR')).toBeInTheDocument()
    expect(
      screen.getByText('https://www.jesusfilm.org/watch/jesus.html')
    ).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Video embedded')).toBeInTheDocument()
    expect(screen.getByText('In-video QR')).toBeInTheDocument()
    expect(screen.getByText('Autumn launch')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New link' })).toHaveAttribute(
      'href',
      '/links/new'
    )
  })

  it('refetches with the status filter', async () => {
    render(
      <MockedProvider
        mocks={[shortLinksMock, pausedLinksMock, domainsMock, campaignsMock]}
      >
        <SnackbarProvider>
          <LinkList />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(await screen.findByText('JESUS film QR')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('combobox', { name: 'Status' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Paused' }))

    await waitFor(() =>
      expect(screen.queryByText('JESUS film QR')).not.toBeInTheDocument()
    )
  })
})
