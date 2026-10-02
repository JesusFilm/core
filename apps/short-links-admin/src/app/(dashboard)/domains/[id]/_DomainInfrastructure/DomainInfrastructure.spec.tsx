import { MockedProvider } from '@apollo/client/testing/react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { notify } from '../../../../../libs/toast'

import {
  DomainInfrastructure,
  GET_SHORT_LINK_DOMAIN_INFRASTRUCTURE,
  SHORT_LINK_DOMAIN_KV_SETUP,
  SHORT_LINK_DOMAIN_WORKER_ATTACH,
  SHORT_LINK_DOMAIN_WORKER_DETACH
} from './DomainInfrastructure'

vi.mock('../../../../../libs/toast')

type State = 'ok' | 'missing' | 'mismatch' | 'error' | 'unknown'

function check(state: State, detail: string) {
  return { __typename: 'ShortLinkDomainInfrastructureCheck', state, detail }
}

interface InfrastructureOverrides {
  configured?: boolean
  hostnameAllowed?: boolean
  kvNamespace?: State
  kvBinding?: State
  attachment?: State
}

function infrastructureMock({
  configured = true,
  hostnameAllowed = true,
  kvNamespace = 'ok',
  kvBinding = 'ok',
  attachment = 'missing'
}: InfrastructureOverrides = {}) {
  return {
    request: {
      query: GET_SHORT_LINK_DOMAIN_INFRASTRUCTURE,
      variables: { id: 'domain-1' }
    },
    result: {
      data: {
        shortLinkDomain: {
          __typename: 'QueryShortLinkDomainSuccess',
          data: {
            __typename: 'ShortLinkDomain',
            id: 'domain-1',
            hostname: 'stage.jesus.film',
            pathPrefix: 's',
            infrastructure: {
              __typename: 'ShortLinkDomainInfrastructure',
              configured,
              workerName: configured ? 'short-links-redirect-stage' : null,
              hostnameAllowed,
              zone: check('ok', 'jesus.film'),
              kvNamespace: check(kvNamespace, `namespace is ${kvNamespace}`),
              kvBinding: check(kvBinding, `binding is ${kvBinding}`),
              attachment: check(attachment, `attachment is ${attachment}`)
            }
          }
        }
      }
    }
  }
}

const domainFields = {
  __typename: 'ShortLinkDomain',
  id: 'domain-1',
  hostname: 'stage.jesus.film',
  pathPrefix: 's',
  apexName: 'stage.jesus.film',
  kvNamespaceId: 'ns-1',
  kvBinding: 'KV_STAGE_JESUS_FILM',
  services: [],
  redirectStatus: 307,
  slugAllowedChars: 'a-z0-9-',
  slugMinLength: 3,
  slugMaxLength: 32,
  slugCaseSensitive: false,
  reservedPaths: [],
  fallbackTo: null,
  notFound: 'lostPage',
  passthroughOrigin: null,
  autoFailover: false,
  edgePublishedAt: '2026-10-01T00:00:00.000Z',
  linkCount: 2
}

function mutationMock(
  query:
    | typeof SHORT_LINK_DOMAIN_KV_SETUP
    | typeof SHORT_LINK_DOMAIN_WORKER_ATTACH
    | typeof SHORT_LINK_DOMAIN_WORKER_DETACH,
  field: string,
  typename: string
) {
  return {
    request: { query, variables: { id: 'domain-1' } },
    result: vi.fn(() => ({
      data: { [field]: { __typename: typename, data: domainFields } }
    }))
  }
}

function renderCard(mocks: unknown[]): void {
  render(
    <MockedProvider mocks={mocks as never}>
      <DomainInfrastructure domainId="domain-1" />
    </MockedProvider>
  )
}

describe('DomainInfrastructure', () => {
  afterEach(() => {
    vi.mocked(notify).mockClear()
  })

  it('shows the live checklist and the Worker it was checked against', async () => {
    renderCard([infrastructureMock({ kvBinding: 'missing' })])

    expect(
      await screen.findByText(
        'Worker short-links-redirect-stage · checked live'
      )
    ).toBeInTheDocument()
    const rows = screen.getAllByRole('listitem')
    expect(rows.map((row) => row.textContent)).toEqual([
      'ZoneOKjesus.film',
      'KV namespaceOKnamespace is ok',
      'Worker bindingMissingbinding is missing',
      'Attached to WorkerMissingattachment is missing'
    ])
    // not attachable until the KV setup is complete
    expect(screen.getByRole('button', { name: 'Set up KV' })).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Attach to Worker' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Detach from Worker' })
    ).toBeDisabled()
  })

  it('sets up KV and checks Cloudflare again', async () => {
    const setup = mutationMock(
      SHORT_LINK_DOMAIN_KV_SETUP,
      'shortLinkDomainKvSetup',
      'MutationShortLinkDomainKvSetupSuccess'
    )
    renderCard([
      infrastructureMock({ kvNamespace: 'missing', kvBinding: 'missing' }),
      setup,
      infrastructureMock()
    ])

    await userEvent.click(
      await screen.findByRole('button', { name: 'Set up KV' })
    )

    await waitFor(() => expect(setup.result).toHaveBeenCalled())
    expect(notify).toHaveBeenCalledWith(
      'KV set up and links published',
      'success'
    )
    expect(await screen.findByText('binding is ok')).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: 'Attach to Worker' })
    ).toBeEnabled()
  })

  it('attaches only after the confirmation names the address and the Worker', async () => {
    const attach = mutationMock(
      SHORT_LINK_DOMAIN_WORKER_ATTACH,
      'shortLinkDomainWorkerAttach',
      'MutationShortLinkDomainWorkerAttachSuccess'
    )
    renderCard([
      infrastructureMock(),
      attach,
      infrastructureMock({ attachment: 'ok' })
    ])

    await userEvent.click(
      await screen.findByRole('button', { name: 'Attach to Worker' })
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(
        'Attach stage.jesus.film/s to short-links-redirect-stage?'
      )
    ).toBeInTheDocument()
    expect(attach.result).not.toHaveBeenCalled()

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Attach' })
    )

    await waitFor(() => expect(attach.result).toHaveBeenCalled())
    expect(notify).toHaveBeenCalledWith('Attached to the Worker', 'success')
  })

  it('detaches only after the hostname has been typed', async () => {
    const detach = mutationMock(
      SHORT_LINK_DOMAIN_WORKER_DETACH,
      'shortLinkDomainWorkerDetach',
      'MutationShortLinkDomainWorkerDetachSuccess'
    )
    renderCard([
      infrastructureMock({ attachment: 'ok' }),
      detach,
      infrastructureMock()
    ])

    // attached: KV cannot be removed from under it
    expect(
      await screen.findByRole('button', { name: 'Remove KV' })
    ).toBeDisabled()

    await userEvent.click(
      screen.getByRole('button', { name: 'Detach from Worker' })
    )
    const dialog = await screen.findByRole('alertdialog')
    const confirm = within(dialog).getByRole('button', { name: 'Detach' })
    expect(confirm).toBeDisabled()

    await userEvent.type(
      within(dialog).getByRole('textbox', {
        name: 'Type stage.jesus.film to confirm'
      }),
      'stage.jesus.film'
    )
    await userEvent.click(confirm)

    await waitFor(() => expect(detach.result).toHaveBeenCalled())
    expect(notify).toHaveBeenCalledWith('Detached from the Worker', 'success')
  })

  it('explains itself and offers no buttons where management is not configured', async () => {
    renderCard([
      infrastructureMock({
        configured: false,
        hostnameAllowed: false,
        kvNamespace: 'unknown',
        kvBinding: 'unknown',
        attachment: 'unknown'
      })
    ])

    expect(
      await screen.findByText(
        /Cloudflare infrastructure management is not configured in this environment/
      )
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Set up KV' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('will not set up a hostname the environment does not allow', async () => {
    renderCard([
      infrastructureMock({
        hostnameAllowed: false,
        kvNamespace: 'missing',
        kvBinding: 'missing'
      })
    ])

    expect(
      await screen.findByText(
        /This environment is not allowed to set stage.jesus.film up on Cloudflare/
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set up KV' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Attach to Worker' })
    ).toBeDisabled()
  })
})
