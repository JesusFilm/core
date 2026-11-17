import { createRequire } from 'node:module'

import { prismaMock } from '../../../test/prismaMock'
import { builder } from '../builder'

import { lookupUser } from './service/lookupUser'
import './userDeleteConfirm'

const { parse, subscribe } = createRequire(import.meta.url)(
  'graphql'
) as typeof import('graphql')

const firebase = vi.hoisted(() => ({
  deleteUser: vi.fn(),
  getUserByEmail: vi.fn()
}))

vi.mock('@core/yoga/firebaseClient', () => ({ auth: firebase }))
vi.mock('./service/lookupUser', () => ({ lookupUser: vi.fn() }))

const document = parse(`subscription DeleteAccount {
  userDeleteConfirm(
    idType: email
    id: "synthetic@example.com"
    deletedJourneyIds: []
    deletedTeamIds: []
    deletedUserJourneyIds: []
    deletedUserTeamIds: []
  ) { done success log { message level } }
}`)
const schema = builder.toSubGraphSchema({
  linkUrl: 'https://specs.apollo.dev/federation/v2.6'
})

describe('userDeleteConfirm identity reconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('MCP_READS_ENABLED', 'true')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', 'http://127.0.0.1:4011')
    vi.stubEnv(
      'MCP_ACCOUNT_AUTHORITY_SECRET',
      'users-permission-secret-at-least-32-characters'
    )
    vi.mocked(lookupUser).mockResolvedValue({
      user: {
        id: 'target-db-id',
        userId: 'self-uid',
        email: 'synthetic@example.com'
      } as Awaited<ReturnType<typeof lookupUser>>['user'],
      firebase: {
        exists: true,
        uid: 'email-reassigned-uid',
        email: 'synthetic@example.com',
        disabled: false,
        providerIds: ['password']
      },
      logs: []
    })
    prismaMock.userDeleteAuditLog.create.mockResolvedValue({
      id: 'audit-subscription'
    } as Awaited<ReturnType<typeof prismaMock.userDeleteAuditLog.create>>)
    firebase.deleteUser.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  async function deleteThroughSubscription(superAdmin: boolean) {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'caller-db-id',
      userId: superAdmin ? 'admin-uid' : 'self-uid',
      superAdmin,
      email: 'caller@example.com'
    } as Awaited<ReturnType<typeof prismaMock.user.findUnique>>)
    const execution = await subscribe({
      schema,
      document,
      contextValue: {
        type: 'authenticated',
        currentUser: {
          id: superAdmin ? 'admin-uid' : 'self-uid',
          email: 'caller@example.com'
        }
      }
    })
    if (!('next' in execution))
      throw new Error(JSON.stringify(execution.errors))
    const messages: Array<Record<string, unknown>> = []
    for await (const event of execution) {
      expect(event.errors).toBeUndefined()
      messages.push(event.data?.userDeleteConfirm as Record<string, unknown>)
    }
    return messages
  }

  it('rejects a foreign resolved identity for ordinary self-deletion before retirement or deletion', async () => {
    const retire = vi.fn()
    vi.stubGlobal('fetch', retire)

    const messages = await deleteThroughSubscription(false)

    expect(messages.at(-1)).toMatchObject({ done: true, success: false })
    expect(retire).not.toHaveBeenCalled()
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
    expect(firebase.deleteUser).not.toHaveBeenCalled()
  })

  it('allows server-authorized superAdmin reconciliation and retires both identities first', async () => {
    const retire = vi
      .fn()
      .mockImplementation(async () => Response.json({ status: 'complete' }))
    vi.stubGlobal('fetch', retire)

    const messages = await deleteThroughSubscription(true)

    expect(messages.at(-1)).toMatchObject({ done: true, success: true })
    expect(
      retire.mock.calls
        .slice(0, 2)
        .map((call) => JSON.parse(String(call[1].body)))
    ).toEqual([{ userId: 'self-uid' }, { userId: 'email-reassigned-uid' }])
    expect(retire.mock.invocationCallOrder[1]).toBeLessThan(
      prismaMock.user.delete.mock.invocationCallOrder[0]
    )
    expect(firebase.deleteUser.mock.calls.map((call) => call[0])).toEqual([
      'self-uid',
      'email-reassigned-uid'
    ])
  })

  it('returns Pending through the real subscription while accepted work remains unresolved', async () => {
    const lookup = await vi.mocked(lookupUser)('email', 'synthetic@example.com')
    vi.mocked(lookupUser).mockResolvedValue({
      ...lookup,
      firebase: { ...lookup.firebase, uid: 'self-uid' }
    })
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(async () => Response.json({ status: 'pending' }))
    )

    const messages = await deleteThroughSubscription(false)

    expect(messages.at(-1)).toMatchObject({ done: true, success: false })
    expect(
      messages.some((message) =>
        JSON.stringify(message.log).includes('MCP withdrawal is Pending')
      )
    ).toBe(true)
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
    expect(firebase.deleteUser).not.toHaveBeenCalled()
  })
})
