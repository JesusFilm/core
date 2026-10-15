import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GET_SHORT_LINK_DOMAINS } from '../../../../../libs/shortLink'

import { AddDomainDialog, SHORT_LINK_DOMAIN_CREATE } from './AddDomainDialog'

const created = {
  __typename: 'ShortLinkDomain',
  id: 'domain-new',
  hostname: 'jesus.movie',
  pathPrefix: 's',
  apexName: 'jesus.movie',
  kvNamespaceId: null,
  kvBinding: null,
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
  linkCount: 0
}

const domainsRefetch = {
  request: { query: GET_SHORT_LINK_DOMAINS },
  result: {
    data: {
      shortLinkDomains: {
        __typename: 'QueryShortLinkDomainsConnection',
        edges: []
      }
    }
  }
}

function createMock(
  input: { hostname: string; pathPrefix: string },
  shortLinkDomainCreate: unknown
) {
  return {
    request: {
      query: SHORT_LINK_DOMAIN_CREATE,
      variables: { input: { ...input, vercel: false } }
    },
    result: vi.fn(() => ({ data: { shortLinkDomainCreate } }))
  }
}

describe('AddDomainDialog', () => {
  const onClose = vi.fn()
  const onCreated = vi.fn()

  function renderDialog(mocks: unknown[]): void {
    render(
      <MockedProvider mocks={mocks as never}>
        <AddDomainDialog open onClose={onClose} onCreated={onCreated} />
      </MockedProvider>
    )
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('adds a Worker-served domain under the s prefix by default', async () => {
    const create = createMock(
      { hostname: 'jesus.movie', pathPrefix: 's' },
      { __typename: 'MutationShortLinkDomainCreateSuccess', data: created }
    )
    renderDialog([create, domainsRefetch])

    expect(screen.getByRole('textbox', { name: 'Path prefix' })).toHaveValue(
      's'
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Hostname' }),
      'Jesus.Movie'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add domain' }))

    await waitFor(() => expect(create.result).toHaveBeenCalled())
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith('domain-new'))
    expect(onClose).toHaveBeenCalled()
  })

  it('rejects something that is not a hostname without calling the server', async () => {
    const create = createMock(
      { hostname: 'not a host', pathPrefix: 's' },
      { __typename: 'MutationShortLinkDomainCreateSuccess', data: created }
    )
    renderDialog([create])

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Hostname' }),
      'not a host'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add domain' }))

    expect(
      await screen.findByText('Enter a hostname such as jesus.film')
    ).toBeInTheDocument()
    expect(create.result).not.toHaveBeenCalled()
  })

  it('shows the server error when the domain already exists', async () => {
    const create = createMock(
      { hostname: 'jesus.film', pathPrefix: 's' },
      {
        __typename: 'NotUniqueError',
        message: 'short link domain already exists',
        location: [
          {
            __typename: 'ErrorLocation',
            path: ['input', 'hostname'],
            value: 'jesus.film'
          }
        ]
      }
    )
    renderDialog([create])

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Hostname' }),
      'jesus.film'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add domain' }))

    expect(
      (await screen.findAllByText('short link domain already exists')).length
    ).toBeGreaterThan(0)
    expect(onCreated).not.toHaveBeenCalled()
  })
})
