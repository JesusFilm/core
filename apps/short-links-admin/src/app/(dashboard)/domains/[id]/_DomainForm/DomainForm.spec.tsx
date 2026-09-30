import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'next/navigation'

import {
  DomainForm,
  GET_SHORT_LINK_DOMAIN,
  SHORT_LINK_DOMAIN_UPDATE
} from './DomainForm'

vi.mock('next/navigation')

vi.mocked(useParams).mockReturnValue({ id: 'domain-1' })

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

function renderForm(mocks: unknown[]): void {
  render(
    <MockedProvider mocks={mocks as never}>
      <DomainForm />
    </MockedProvider>
  )
}

describe('DomainForm', () => {
  it('submits the path prefix', async () => {
    const update = updateMock('s')
    renderForm([domainMock, update])

    const field = await screen.findByRole('textbox', { name: 'Path prefix' })
    expect(field).toHaveValue('')
    expect(
      screen.getByText(
        'Path the short links live under, without slashes, e.g. s. Leave empty for the root.'
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
        'Upper-case letters, digits and _ only, starting with a letter, e.g. KV_JESUS_FILM'
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
})
