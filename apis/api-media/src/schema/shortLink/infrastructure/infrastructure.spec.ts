import { type MockedFunction, vi } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { buildShortLinkDomain } from '../../../../test/shortLinkFixtures'
import { usersPrismaMock } from '../../../../test/usersPrismaMock'

import {
  attachDomain,
  detachDomain,
  removeDomainKv,
  setupDomainKv
} from './operations'
import { getDomainInfrastructure } from './status'

vi.mock('./operations', () => ({
  setupDomainKv: vi.fn(),
  removeDomainKv: vi.fn(),
  attachDomain: vi.fn(),
  detachDomain: vi.fn()
}))
vi.mock('./status', () => ({ getDomainInfrastructure: vi.fn() }))

const getDomainInfrastructureMock = getDomainInfrastructure as MockedFunction<
  typeof getDomainInfrastructure
>

const INFRASTRUCTURE_QUERY = graphql(`
  query ShortLinkDomainInfrastructureQuery($id: String!) {
    shortLinkDomain(id: $id) {
      ... on QueryShortLinkDomainSuccess {
        data {
          id
          infrastructure {
            configured
            workerName
            hostnameAllowed
            zone {
              state
              detail
            }
            kvNamespace {
              state
              detail
            }
            kvBinding {
              state
              detail
            }
            attachment {
              state
              detail
            }
          }
        }
      }
    }
  }
`)

const KV_SETUP_MUTATION = graphql(`
  mutation ShortLinkDomainKvSetupMutation($id: String!) {
    shortLinkDomainKvSetup(id: $id) {
      ... on MutationShortLinkDomainKvSetupSuccess {
        data {
          id
          kvNamespaceId
          kvBinding
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
`)

const KV_REMOVE_MUTATION = graphql(`
  mutation ShortLinkDomainKvRemoveMutation($id: String!) {
    shortLinkDomainKvRemove(id: $id) {
      ... on MutationShortLinkDomainKvRemoveSuccess {
        data {
          id
        }
      }
    }
  }
`)

const WORKER_ATTACH_MUTATION = graphql(`
  mutation ShortLinkDomainWorkerAttachMutation($id: String!) {
    shortLinkDomainWorkerAttach(id: $id) {
      ... on MutationShortLinkDomainWorkerAttachSuccess {
        data {
          id
        }
      }
    }
  }
`)

const WORKER_DETACH_MUTATION = graphql(`
  mutation ShortLinkDomainWorkerDetachMutation($id: String!) {
    shortLinkDomainWorkerDetach(id: $id) {
      ... on MutationShortLinkDomainWorkerDetachSuccess {
        data {
          id
        }
      }
    }
  }
`)

describe('short link domain infrastructure', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'userId' } }
  })

  function setSuperAdmin(superAdmin: boolean): void {
    usersPrismaMock.user.findUnique.mockResolvedValue({
      superAdmin
    } as Awaited<ReturnType<typeof usersPrismaMock.user.findUnique>>)
  }

  const domain = buildShortLinkDomain({
    id: 'domainId',
    hostname: 'stage.jesus.film',
    pathPrefix: 's',
    kvNamespaceId: 'ns-1',
    kvBinding: 'KV_STAGE_JESUS_FILM'
  })

  beforeEach(() => {
    // every media role, so only superAdmin decides
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'userId',
      roles: ['publisher', 'shortLinkAdmin'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    setSuperAdmin(true)
    prismaMock.shortLinkDomain.findFirstOrThrow.mockResolvedValue(domain)
    prismaMock.shortLinkDomain.findUniqueOrThrow.mockResolvedValue(domain)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('ShortLinkDomain.infrastructure', () => {
    const ok = { state: 'ok' as const, detail: 'fine' }

    it('returns the live status to a superAdmin', async () => {
      getDomainInfrastructureMock.mockResolvedValue({
        configured: true,
        workerName: 'short-links-redirect-stage',
        hostnameAllowed: true,
        zone: ok,
        kvNamespace: ok,
        kvBinding: {
          state: 'missing',
          detail:
            'short-links-redirect-stage has no KV_STAGE_JESUS_FILM binding'
        },
        attachment: ok
      })

      const result = await authClient({
        document: INFRASTRUCTURE_QUERY,
        variables: { id: 'domainId' }
      })

      expect(result).toMatchObject({
        data: {
          shortLinkDomain: {
            data: {
              id: 'domainId',
              infrastructure: {
                configured: true,
                workerName: 'short-links-redirect-stage',
                hostnameAllowed: true,
                kvBinding: {
                  state: 'missing',
                  detail:
                    'short-links-redirect-stage has no KV_STAGE_JESUS_FILM binding'
                }
              }
            }
          }
        }
      })
      expect(getDomainInfrastructureMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'stage.jesus.film',
          pathPrefix: 's',
          kvNamespaceId: 'ns-1',
          kvBinding: 'KV_STAGE_JESUS_FILM'
        })
      )
    })

    it('is refused to a publisher and shortLinkAdmin who is not a superAdmin', async () => {
      setSuperAdmin(false)

      const result = await authClient({
        document: INFRASTRUCTURE_QUERY,
        variables: { id: 'domainId' }
      })

      expect(result).toMatchObject({ errors: [expect.anything()] })
      expect(getDomainInfrastructureMock).not.toHaveBeenCalled()
    })
  })

  const variables = { id: 'domainId' }

  describe.each([
    [
      'shortLinkDomainKvSetup',
      async () => await authClient({ document: KV_SETUP_MUTATION, variables }),
      setupDomainKv
    ],
    [
      'shortLinkDomainKvRemove',
      async () => await authClient({ document: KV_REMOVE_MUTATION, variables }),
      removeDomainKv
    ],
    [
      'shortLinkDomainWorkerAttach',
      async () =>
        await authClient({ document: WORKER_ATTACH_MUTATION, variables }),
      attachDomain
    ],
    [
      'shortLinkDomainWorkerDetach',
      async () =>
        await authClient({ document: WORKER_DETACH_MUTATION, variables }),
      detachDomain
    ]
  ])('%s', (field, run, operation) => {
    it('runs for a superAdmin and returns the domain', async () => {
      const result = await run()

      expect(result).toMatchObject({
        data: { [field]: { data: { id: 'domainId' } } }
      })
      expect(operation).toHaveBeenCalledWith('domainId')
    })

    it('is refused to a publisher and shortLinkAdmin who is not a superAdmin', async () => {
      setSuperAdmin(false)

      const result = await run()

      expect(result).toMatchObject({ errors: [expect.anything()] })
      expect(operation).not.toHaveBeenCalled()
    })
  })

  it('shows the superAdmin what Cloudflare said when a call fails', async () => {
    vi.mocked(attachDomain).mockRejectedValue(
      Object.assign(new Error('400'), {
        status: 400,
        errors: [
          {
            code: 100117,
            message: 'Hostname already has externally managed DNS records'
          }
        ]
      })
    )

    const result = await authClient({
      document: WORKER_ATTACH_MUTATION,
      variables: { id: 'domainId' }
    })

    expect(result).toMatchObject({
      errors: [
        expect.objectContaining({
          message:
            'Cloudflare: Hostname already has externally managed DNS records (100117)'
        })
      ]
    })
  })
})
