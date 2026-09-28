import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

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
  linkCount: 0
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

function updateMock(pathPrefix: string) {
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
          autoFailover: false
        }
      }
    },
    result: vi.fn(() => ({
      data: {
        shortLinkDomainUpdate: {
          __typename: 'MutationShortLinkDomainUpdateSuccess',
          data: { ...domain, pathPrefix }
        }
      }
    }))
  }
}

function renderForm(mocks: unknown[]): void {
  render(
    <MockedProvider mocks={mocks as never}>
      <SnackbarProvider>
        <DomainForm />
      </SnackbarProvider>
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
