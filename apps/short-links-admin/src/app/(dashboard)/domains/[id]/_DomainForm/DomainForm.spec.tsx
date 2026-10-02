import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams, useRouter } from 'next/navigation'

import { GET_SHORT_LINK_DOMAINS } from '../../../../../libs/shortLink'
import { notify } from '../../../../../libs/toast'
import { GET_SHORT_LINK_ACCESS } from '../../../../../libs/useShortLinkAccess'

import {
  DomainForm,
  GET_SHORT_LINK_DOMAIN,
  SHORT_LINK_DOMAIN_DELETE,
  SHORT_LINK_DOMAIN_PUBLISH,
  SHORT_LINK_DOMAIN_UPDATE
} from './DomainForm'

vi.mock('next/navigation')
vi.mock('../../../../../libs/toast')
// the card runs its own live query; it has its own spec
vi.mock('../_DomainInfrastructure', () => ({
  DomainInfrastructure: ({ domainId }: { domainId: string }) => (
    <div data-testid="DomainInfrastructure">{domainId}</div>
  )
}))

const push = vi.fn()
vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
  typeof useRouter
>)
vi.mocked(useParams).mockReturnValue({ id: 'domain-1' })

function accessMock(superAdmin: boolean) {
  return {
    request: { query: GET_SHORT_LINK_ACCESS },
    result: {
      data: {
        me: {
          __typename: 'AuthenticatedUser',
          id: 'user-1',
          mediaUserRoles: ['shortLinkAdmin'],
          superAdmin
        }
      }
    }
  }
}

const domain = {
  __typename: 'ShortLinkDomain',
  id: 'domain-1',
  hostname: 'jesus.film',
  pathPrefix: '',
  apexName: 'jesus.film',
  services: [],
  redirectStatus: 307,
  slugAllowedChars: 'a-z0-9-',
  slugMinLength: 3,
  slugMaxLength: 32,
  slugCaseSensitive: false,
  reservedPaths: ['dashboard'],
  fallbackTo: 'https://www.jesusfilm.org',
  notFound: 'fallback',
  passthroughOrigin: null,
  autoFailover: false,
  edgePublishedAt: null,
  linkCount: 0,
  kvNamespaceId: null,
  kvBinding: null
}

const domainMock = {
  request: { query: GET_SHORT_LINK_DOMAIN, variables: { id: 'domain-1' } },
  result: {
    data: {
      shortLinkDomain: {
        __typename: 'QueryShortLinkDomainSuccess',
        data: domain
      }
    }
  }
}

function updateMock(
  pathPrefix: string,
  kv: { kvNamespaceId: string | null; kvBinding: string | null } = {
    kvNamespaceId: null,
    kvBinding: null
  }
) {
  return {
    request: {
      query: SHORT_LINK_DOMAIN_UPDATE,
      variables: {
        input: {
          id: 'domain-1',
          services: [],
          redirectStatus: 307,
          pathPrefix,
          slugAllowedChars: 'a-z0-9-',
          slugMinLength: 3,
          slugMaxLength: 32,
          slugCaseSensitive: false,
          reservedPaths: ['dashboard'],
          fallbackTo: 'https://www.jesusfilm.org',
          notFound: 'fallback',
          passthroughOrigin: null,
          autoFailover: false,
          ...kv
        }
      }
    },
    result: vi.fn(() => ({
      data: {
        shortLinkDomainUpdate: {
          __typename: 'MutationShortLinkDomainUpdateSuccess',
          data: { ...domain, pathPrefix, ...kv }
        }
      }
    }))
  }
}

function publishMock(edgePublishedAt: string | null) {
  return {
    request: {
      query: SHORT_LINK_DOMAIN_PUBLISH,
      variables: { id: 'domain-1' }
    },
    result: {
      data: {
        shortLinkDomainPublish: {
          __typename: 'MutationShortLinkDomainPublishSuccess',
          data: { ...domain, edgePublishedAt }
        }
      }
    }
  }
}

function renderForm(
  mocks: unknown[],
  { superAdmin = true }: { superAdmin?: boolean } = {}
): void {
  render(
    <MockedProvider mocks={[accessMock(superAdmin), ...mocks] as never}>
      <DomainForm />
    </MockedProvider>
  )
}

describe('DomainForm', () => {
  afterEach(() => {
    vi.mocked(notify).mockClear()
    push.mockClear()
  })

  it('confirms a republish that api-media stamped with a new time', async () => {
    renderForm([domainMock, publishMock('2026-09-25T12:00:00.000Z')])

    await userEvent.click(
      await screen.findByRole('button', { name: 'Republish domain' })
    )

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        'Domain and its links republished to the edge',
        'success'
      )
    )
  })

  it('warns when the republish left the published time unchanged', async () => {
    renderForm([domainMock, publishMock(domain.edgePublishedAt)])

    await userEvent.click(
      await screen.findByRole('button', { name: 'Republish domain' })
    )

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        'Not published',
        'warning',
        'Edge publishing is not configured in this environment.'
      )
    )
  })

  it('submits the path prefix', async () => {
    const update = updateMock('s')
    renderForm([domainMock, update])

    const field = await screen.findByRole('textbox', { name: 'Path prefix' })
    expect(field).toHaveValue('')
    expect(
      screen.getByText(
        'Path the short links live under, without slashes, e.g. s. Leave empty for the root. Changing it changes what must be attached to the Worker.'
      )
    ).toBeInTheDocument()

    await userEvent.type(field, 's')
    await userEvent.click(screen.getByRole('button', { name: 'Save domain' }))

    await waitFor(() => expect(update.result).toHaveBeenCalled())
    expect(
      await screen.findByRole('heading', { name: 'jesus.film/s' })
    ).toBeInTheDocument()
  })

  it('submits the KV namespace id and worker binding', async () => {
    const update = updateMock('', {
      kvNamespaceId: 'abc123namespace',
      kvBinding: 'KV_JESUS_FILM'
    })
    renderForm([domainMock, update])

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'KV namespace id' }),
      'abc123namespace'
    )
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Worker binding' }),
      'KV_JESUS_FILM'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save domain' }))

    await waitFor(() => expect(update.result).toHaveBeenCalled())
  })

  it('rejects a lower-case worker binding', async () => {
    const update = updateMock('', {
      kvNamespaceId: null,
      kvBinding: 'kv_jesus_film'
    })
    renderForm([domainMock, update])

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Worker binding' }),
      'kv_jesus_film'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save domain' }))

    expect(
      await screen.findByText(
        'Upper-case letters, digits and _ only, starting with KV_, e.g. KV_JESUS_FILM'
      )
    ).toBeInTheDocument()
    expect(update.result).not.toHaveBeenCalled()
  })

  it('rejects a prefix with slashes around it', async () => {
    const update = updateMock('/s/')
    renderForm([domainMock, update])

    const field = await screen.findByRole('textbox', { name: 'Path prefix' })
    await userEvent.type(field, '/s/')
    await userEvent.click(screen.getByRole('button', { name: 'Save domain' }))

    expect(
      await screen.findByText(
        'Letters, numbers, _ and - only, with no leading or trailing slash'
      )
    ).toBeInTheDocument()
    expect(update.result).not.toHaveBeenCalled()
  })

  describe('for an admin who is not a superAdmin', () => {
    it('hides the infrastructure fields and leaves them out of the save', async () => {
      const update = {
        request: {
          query: SHORT_LINK_DOMAIN_UPDATE,
          variables: {
            input: {
              id: 'domain-1',
              services: [],
              redirectStatus: 307,
              slugAllowedChars: 'a-z0-9-',
              slugMinLength: 3,
              slugMaxLength: 32,
              slugCaseSensitive: false,
              reservedPaths: ['dashboard'],
              fallbackTo: 'https://www.jesusfilm.org',
              notFound: 'fallback',
              passthroughOrigin: null,
              autoFailover: false
            }
          }
        },
        result: vi.fn(() => ({
          data: {
            shortLinkDomainUpdate: {
              __typename: 'MutationShortLinkDomainUpdateSuccess',
              data: domain
            }
          }
        }))
      }
      renderForm([domainMock, update], { superAdmin: false })

      await userEvent.click(
        await screen.findByRole('button', { name: 'Save domain' })
      )

      await waitFor(() => expect(update.result).toHaveBeenCalled())
      expect(
        screen.queryByRole('textbox', { name: 'Path prefix' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('textbox', { name: 'KV namespace id' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('textbox', { name: 'Worker binding' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Remove domain' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('DomainInfrastructure')
      ).not.toBeInTheDocument()
    })
  })

  describe('for a superAdmin', () => {
    it('shows the Cloudflare infrastructure card', async () => {
      renderForm([domainMock])

      expect(
        await screen.findByTestId('DomainInfrastructure')
      ).toHaveTextContent('domain-1')
    })

    it('removes the domain once its hostname has been typed', async () => {
      const remove = {
        request: {
          query: SHORT_LINK_DOMAIN_DELETE,
          variables: { id: 'domain-1' }
        },
        result: vi.fn(() => ({
          data: {
            shortLinkDomainDelete: {
              __typename: 'MutationShortLinkDomainDeleteSuccess',
              data: { __typename: 'ShortLinkDomain', id: 'domain-1' }
            }
          }
        }))
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
      renderForm([domainMock, remove, domainsRefetch])

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove domain' })
      )
      const dialog = await screen.findByRole('alertdialog')
      const confirm = within(dialog).getByRole('button', {
        name: 'Remove domain'
      })
      expect(confirm).toBeDisabled()

      await userEvent.type(
        within(dialog).getByRole('textbox', {
          name: 'Type jesus.film to confirm'
        }),
        'jesus.film'
      )
      await userEvent.click(confirm)

      await waitFor(() => expect(remove.result).toHaveBeenCalled())
      await waitFor(() => expect(push).toHaveBeenCalledWith('/domains'))
      expect(notify).toHaveBeenCalledWith('Domain removed', 'success')
    })
  })
})
