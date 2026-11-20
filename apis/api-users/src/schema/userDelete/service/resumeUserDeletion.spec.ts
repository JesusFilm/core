import { prismaMock } from '../../../../test/prismaMock'

import { resumeUserDeletion } from './resumeUserDeletion'

const firebase = vi.hoisted(() => ({
  deleteUser: vi.fn(),
  getUserByEmail: vi.fn()
}))
vi.mock('@core/yoga/firebaseClient', () => ({ auth: firebase }))

const progress = {
  id: 'audit',
  deletedUserId: 'user-record',
  deletedUserFirebaseUid: 'self',
  callerUserId: 'user-record',
  callerEmail: 'self@example.com',
  retiredFirebaseUids: ['self'],
  firebaseCleanupUids: ['self'],
  deletedJourneyIds: [],
  deletedTeamIds: [],
  deletedUserJourneyIds: [],
  deletedUserTeamIds: [],
  success: false,
  errorMessage: null,
  completedAt: null,
  createdAt: new Date()
} satisfies NonNullable<
  Awaited<ReturnType<typeof prismaMock.userDeleteAuditLog.findFirst>>
>

describe('resuming committed Users deletion', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.findFirst.mockResolvedValue(null)
    prismaMock.userDeleteAuditLog.findFirst.mockResolvedValue(progress)
    firebase.deleteUser.mockReset().mockResolvedValue(undefined)
    firebase.getUserByEmail.mockReset()
    vi.stubEnv('MCP_READS_ENABLED', 'true')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', 'http://127.0.0.1:4011')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_SECRET', 's'.repeat(32))
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Auth unavailable'))
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('keeps a missing-row caller bound to its own original self-deletion', async () => {
    expect(
      await resumeUserDeletion('databaseId', 'user-record', 'stranger')
    ).toBeNull()
    expect(firebase.deleteUser).not.toHaveBeenCalled()
  })

  it('rejects a replacement Users projection before touching Firebase', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'replacement'
    } as Awaited<ReturnType<typeof prismaMock.user.findFirst>>)
    expect(
      await resumeUserDeletion('databaseId', 'user-record', 'self')
    ).toBeNull()
    expect(firebase.deleteUser).not.toHaveBeenCalled()
  })

  it('cannot use an incomplete retirement record as authority', async () => {
    prismaMock.userDeleteAuditLog.findFirst.mockResolvedValue({
      ...progress,
      retiredFirebaseUids: []
    })
    expect(
      await resumeUserDeletion('databaseId', 'user-record', 'self')
    ).toBeNull()
    expect(firebase.deleteUser).not.toHaveBeenCalled()
  })

  it('retries every recorded fallback target and keeps retirement confirmation separate', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      superAdmin: true
    } as NonNullable<Awaited<ReturnType<typeof prismaMock.user.findUnique>>>)
    prismaMock.userDeleteAuditLog.findFirst.mockResolvedValue({
      ...progress,
      firebaseCleanupUids: ['self', 'fallback-one', 'fallback-two']
    })
    firebase.deleteUser.mockImplementation(async (uid: string) => {
      if (uid === 'self') throw { code: 'auth/user-not-found' }
    })
    const retire = vi
      .fn()
      .mockImplementation(async () => Response.json({ status: 'complete' }))
    vi.stubGlobal('fetch', retire)
    expect(
      await resumeUserDeletion('databaseId', 'user-record', 'admin')
    ).toMatchObject({ success: true })
    expect(firebase.deleteUser.mock.calls.map(([uid]) => uid)).toEqual([
      'self',
      'fallback-one',
      'fallback-two'
    ])
    expect(
      retire.mock.calls.map(([, options]) => JSON.parse(String(options.body)))
    ).toEqual([{ userId: 'fallback-one' }, { userId: 'fallback-two' }])
    expect(firebase.getUserByEmail).not.toHaveBeenCalled()
    expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith({
      where: { id: 'audit' },
      data: { retiredFirebaseUids: { push: 'fallback-one' } }
    })
  })

  it('retries the confirmed identity while Auth is unavailable and marks its original audit complete', async () => {
    expect(
      await resumeUserDeletion('databaseId', 'user-record', 'self')
    ).toMatchObject({ success: true })
    expect(firebase.deleteUser).toHaveBeenCalledExactlyOnceWith('self')
    expect(fetch).not.toHaveBeenCalled()
    expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith({
      where: { id: 'audit' },
      data: { success: true, completedAt: expect.any(Date), errorMessage: null }
    })
  })
})
