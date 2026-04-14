import { prismaMock } from '../../../../test/prismaMock'

import { deleteFirebaseUser, deleteUserData } from './deleteUserData'

const mockDeleteUser = jest.fn()
const mockGetUserByEmail = jest.fn()

jest.mock('@core/yoga/firebaseClient', () => ({
  auth: {
    deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
    getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args)
  }
}))

const baseInput = {
  userDbId: 'db-1',
  firebaseUserId: 'fb-uid-1',
  firebaseUidOverride: null,
  userEmail: 'test@example.com',
  callerUserId: 'caller-1',
  callerEmail: 'admin@example.com',
  deletedJourneyIds: ['j1'],
  deletedTeamIds: ['t1'],
  deletedUserJourneyIds: ['uj1'],
  deletedUserTeamIds: ['ut1']
}

describe('deleteFirebaseUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete firebase user by UID', async () => {
    mockDeleteUser.mockResolvedValueOnce(undefined)

    const logs = await deleteFirebaseUser('fb-uid-1', null, 'test@example.com')

    expect(mockDeleteUser).toHaveBeenCalledWith('fb-uid-1')
    expect(logs.some((l) => l.message.includes('deleted'))).toBe(true)
  })

  it('should try override UID as well', async () => {
    mockDeleteUser.mockResolvedValueOnce(undefined)
    mockDeleteUser.mockResolvedValueOnce(undefined)

    const logs = await deleteFirebaseUser(
      'fb-uid-1',
      'override-uid',
      'test@example.com'
    )

    expect(mockDeleteUser).toHaveBeenCalledWith('fb-uid-1')
    expect(mockDeleteUser).toHaveBeenCalledWith('override-uid')
    expect(logs.filter((l) => l.message.includes('deleted')).length).toBe(2)
  })

  it('should fall back to email when UID not found', async () => {
    mockDeleteUser
      .mockRejectedValueOnce({ code: 'auth/user-not-found' })
      .mockResolvedValueOnce(undefined)
    mockGetUserByEmail.mockResolvedValueOnce({ uid: 'email-uid' })

    const logs = await deleteFirebaseUser('fb-uid-1', null, 'test@example.com')

    expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com')
    expect(mockDeleteUser).toHaveBeenCalledWith('email-uid')
  })

  it('should return error log on hard firebase failure', async () => {
    mockDeleteUser.mockRejectedValueOnce(new Error('Firebase internal error'))

    const logs = await deleteFirebaseUser('fb-uid-1', null, null)

    expect(logs.some((l) => l.level === 'error')).toBe(true)
  })
})

describe('deleteUserData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully delete user data', async () => {
    mockDeleteUser.mockResolvedValueOnce(undefined)
    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-1'
    } as any)
    prismaMock.user.delete.mockResolvedValueOnce({} as any)
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(true)
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: 'db-1' }
    })
    expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith({
      where: { id: 'audit-1' },
      data: { success: true }
    })
  })

  it('should fail if firebase deletion has hard error', async () => {
    // Comment 2: audit log is now created BEFORE Firebase deletion (Comment 3
    // fix), so these mocks are required — the function reaches audit log
    // creation before hitting the Firebase error.
    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-1'
    } as any)
    mockDeleteUser.mockRejectedValueOnce(new Error('Firebase error'))
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(false)
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
  })

  it('should fail if user record deletion fails', async () => {
    mockDeleteUser.mockResolvedValueOnce(undefined)
    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-1'
    } as any)
    prismaMock.user.delete.mockRejectedValueOnce(new Error('DB error'))
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(false)
    expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          errorMessage: expect.stringContaining('DB error')
        })
      })
    )
  })

  it('should fail if audit log creation fails', async () => {
    mockDeleteUser.mockResolvedValueOnce(undefined)
    prismaMock.userDeleteAuditLog.create.mockRejectedValueOnce(
      new Error('Audit error')
    )

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(false)
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
  })
})
