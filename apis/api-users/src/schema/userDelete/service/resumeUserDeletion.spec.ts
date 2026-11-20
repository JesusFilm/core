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
