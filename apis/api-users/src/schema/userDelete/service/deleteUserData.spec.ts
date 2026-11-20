import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'

import { deleteFirebaseUser, deleteUserData } from './deleteUserData'

const mockDeleteUser = vi.fn()
const mockGetUserByEmail = vi.fn()

vi.mock('@core/yoga/firebaseClient', () => ({
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
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock)
    )
  })

  it('should delete firebase user by UID', async () => {
    mockDeleteUser.mockResolvedValueOnce(undefined)

    const logs = await deleteFirebaseUser('fb-uid-1', null, 'test@example.com')

    expect(mockDeleteUser).toHaveBeenCalledWith('fb-uid-1')
    expect(logs.some((l) => l.message.includes('deleted'))).toBe(true)
  })

  it('allows a superAdmin to try a reconciled UID as well', async () => {
    mockDeleteUser.mockResolvedValueOnce(undefined)
    mockDeleteUser.mockResolvedValueOnce(undefined)

    const logs = await deleteFirebaseUser(
      'fb-uid-1',
      'override-uid',
      'test@example.com',
      true
    )

    expect(mockDeleteUser).toHaveBeenCalledWith('fb-uid-1')
    expect(mockDeleteUser).toHaveBeenCalledWith('override-uid')
    expect(logs.filter((l) => l.message.includes('deleted')).length).toBe(2)
  })

  it('allows an explicit superAdmin email fallback when the UID is not found', async () => {
    mockDeleteUser
      .mockRejectedValueOnce({ code: 'auth/user-not-found' })
      .mockResolvedValueOnce(undefined)
    mockGetUserByEmail.mockResolvedValueOnce({ uid: 'email-uid' })

    const logs = await deleteFirebaseUser(
      'fb-uid-1',
      null,
      'test@example.com',
      true
    )

    expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com')
    expect(mockDeleteUser).toHaveBeenCalledWith('email-uid')
    expect(logs.some((log) => log.level === 'error')).toBe(false)
  })

  it('should return error log on hard firebase failure', async () => {
    mockDeleteUser.mockRejectedValueOnce(new Error('Firebase internal error'))

    const logs = await deleteFirebaseUser('fb-uid-1', null, null)

    expect(logs.some((l) => l.level === 'error')).toBe(true)
  })

  it('rejects an unapproved reconciled UID before touching either account', async () => {
    const logs = await deleteFirebaseUser('self-uid', 'foreign-uid', null)
    expect(logs.some((log) => log.level === 'error')).toBe(true)
    expect(mockDeleteUser).not.toHaveBeenCalled()
    expect(mockGetUserByEmail).not.toHaveBeenCalled()
  })

  it('does not treat an email-reassigned UID as the authorized self-deletion target', async () => {
    mockDeleteUser.mockRejectedValueOnce({ code: 'auth/user-not-found' })
    mockGetUserByEmail.mockResolvedValueOnce({ uid: 'foreign-email-owner' })
    const logs = await deleteFirebaseUser(
      'self-uid',
      null,
      'reassigned@example.com'
    )
    expect(logs.some((log) => log.level === 'error')).toBe(true)
    expect(mockDeleteUser).toHaveBeenCalledExactlyOnceWith('self-uid')
  })
})

describe('deleteUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock)
    )
  })

  it('should successfully delete user data', async () => {
    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-1'
    } as any)
    prismaMock.user.delete.mockResolvedValueOnce({} as any)
    mockDeleteUser.mockResolvedValueOnce(undefined)
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(true)
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: 'db-1' }
    })
    expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith({
      where: { id: 'audit-1' },
      data: { success: true, completedAt: expect.any(Date) }
    })
  })

  it('should store firebase UID in audit log', async () => {
    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-1'
    } as any)
    prismaMock.user.delete.mockResolvedValueOnce({} as any)
    mockDeleteUser.mockResolvedValueOnce(undefined)
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    await deleteUserData(baseInput)

    expect(prismaMock.userDeleteAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deletedUserFirebaseUid: 'fb-uid-1'
        })
      })
    )
  })

  it('should delete DB record first, then Firebase', async () => {
    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-1'
    } as any)
    prismaMock.user.delete.mockResolvedValueOnce({} as any)
    mockDeleteUser.mockResolvedValueOnce(undefined)
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(true)
    const dbDeleteOrder = prismaMock.user.delete.mock.invocationCallOrder[0]
    const firebaseDeleteOrder = mockDeleteUser.mock.invocationCallOrder[0]
    expect(dbDeleteOrder).toBeLessThan(firebaseDeleteOrder)
  })

  it('should fail if firebase deletion has hard error after DB delete, leaving retry path open', async () => {
    // DB delete succeeds first, then Firebase fails.
    // The result is success: false so the caller knows Firebase cleanup is
    // still needed — a retry will find no DB record and take the firebase-only path.
    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-1'
    } as any)
    prismaMock.user.delete.mockResolvedValueOnce({} as any)
    mockDeleteUser.mockRejectedValueOnce(new Error('Firebase error'))
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(false)
    // DB was deleted — a retry enters the firebase-only path
    expect(prismaMock.user.delete).toHaveBeenCalled()
  })

  it('should fail if user record deletion fails', async () => {
    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-1'
    } as any)
    prismaMock.user.delete.mockRejectedValueOnce(new Error('DB error'))
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(false)
    // Firebase must not be touched if DB deletion failed
    expect(mockDeleteUser).not.toHaveBeenCalled()
    expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          errorMessage: expect.stringContaining('DB error')
        })
      })
    )
  })

  it('should fail if audit log creation fails', async () => {
    prismaMock.userDeleteAuditLog.create.mockRejectedValueOnce(
      new Error('Audit error')
    )

    const result = await deleteUserData(baseInput)

    expect(result.success).toBe(false)
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
  })

  it('should persist audit log when caller is the deleted user (self-deletion)', async () => {
    // When callerUserId === userDbId the audit log must be created BEFORE the
    // user record is deleted so the log survives even if there were a FK
    // constraint (there isn't, but this confirms the ordering is safe).
    const selfDeleteInput = {
      ...baseInput,
      callerUserId: baseInput.userDbId, // same person
      callerEmail: baseInput.userEmail
    }

    prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
      id: 'audit-self'
    } as any)
    prismaMock.user.delete.mockResolvedValueOnce({} as any)
    mockDeleteUser.mockResolvedValueOnce(undefined)
    prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

    const result = await deleteUserData(selfDeleteInput)

    expect(result.success).toBe(true)

    // Audit log was created before the user was deleted
    const auditCreateOrder =
      prismaMock.userDeleteAuditLog.create.mock.invocationCallOrder[0]
    const userDeleteOrder = prismaMock.user.delete.mock.invocationCallOrder[0]
    expect(auditCreateOrder).toBeLessThan(userDeleteOrder)

    // callerEmail was stored so the log is useful after the user record is gone
    expect(prismaMock.userDeleteAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          callerUserId: baseInput.userDbId,
          callerEmail: baseInput.userEmail,
          deletedUserId: baseInput.userDbId
        })
      })
    )

    // Audit log updated to success after deletion
    expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith({
      where: { id: 'audit-self' },
      data: { success: true, completedAt: expect.any(Date) }
    })
  })
})

describe('MCP retirement through existing account deletion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock)
    )
    vi.stubEnv('MCP_READS_ENABLED', 'true')
    vi.stubEnv('MCP_ACCOUNT_AUTHORITY_URL', 'http://127.0.0.1:4011')
    vi.stubEnv(
      'MCP_ACCOUNT_AUTHORITY_SECRET',
      'users-permission-secret-at-least-32-characters'
    )
    prismaMock.userDeleteAuditLog.create.mockResolvedValue({
      id: 'audit-mcp'
    } as Awaited<ReturnType<typeof prismaMock.userDeleteAuditLog.create>>)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('keeps the DB and Firebase identity while accepted MCP work is unresolved', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation(async () => Response.json({ status: 'pending' }))
    )
    const result = await deleteUserData(baseInput)
    expect(result.success).toBe(false)
    expect(
      result.logs.some((log) =>
        log.message.includes('MCP withdrawal is Pending')
      )
    ).toBe(true)
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('fails closed when the authority cannot confirm retirement', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('controlled authority unavailable'))
    )
    expect((await deleteUserData(baseInput)).success).toBe(false)
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('rejects a foreign UID override before retiring authority or deleting the database user', async () => {
    const retire = vi.fn()
    vi.stubGlobal('fetch', retire)
    const result = await deleteUserData({
      ...baseInput,
      firebaseUidOverride: 'foreign-uid'
    })
    expect(result.success).toBe(false)
    expect(retire).not.toHaveBeenCalled()
    expect(prismaMock.user.delete).not.toHaveBeenCalled()
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('retires both reconciled UIDs before removing the DB user and preserves shared outcomes', async () => {
    const retire = vi
      .fn()
      .mockImplementation(async () => Response.json({ status: 'complete' }))
    vi.stubGlobal('fetch', retire)
    mockDeleteUser.mockResolvedValue(undefined)
    const result = await deleteUserData({
      ...baseInput,
      firebaseUidOverride: 'reconciled-uid',
      allowReconciledUid: true
    })
    expect(result.success).toBe(true)
    expect(
      retire.mock.calls
        .slice(0, 2)
        .map((call) => JSON.parse(String(call[1].body)))
    ).toEqual([{ userId: 'fb-uid-1' }, { userId: 'reconciled-uid' }])
    expect(retire.mock.invocationCallOrder[1]).toBeLessThan(
      prismaMock.user.delete.mock.invocationCallOrder[0]
    )
    expect(prismaMock.userDeleteAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deletedJourneyIds: ['j1'],
          deletedTeamIds: ['t1'],
          deletedUserJourneyIds: ['uj1'],
          deletedUserTeamIds: ['ut1']
        })
      })
    )
  })

  it('continues Firebase deletion using confirmed retirement when Auth fails after SQL deletion', async () => {
    const retire = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ status: 'complete' }))
      .mockRejectedValue(new Error('Auth unavailable after SQL deletion'))
    vi.stubGlobal('fetch', retire)
    mockDeleteUser.mockResolvedValue(undefined)
    const result = await deleteUserData(baseInput)
    expect(result.success).toBe(true)
    expect(retire).toHaveBeenCalledTimes(1)
    expect(mockDeleteUser).toHaveBeenCalledWith('fb-uid-1')
  })

  it('requires fresh retirement for a newly discovered fallback UID after SQL deletion', async () => {
    const retire = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ status: 'complete' }))
      .mockRejectedValue(new Error('Auth unavailable for fallback'))
    vi.stubGlobal('fetch', retire)
    mockDeleteUser.mockRejectedValueOnce({ code: 'auth/user-not-found' })
    mockGetUserByEmail.mockResolvedValueOnce({ uid: 'new-fallback' })
    const result = await deleteUserData({
      ...baseInput,
      allowReconciledUid: true
    })
    expect(result.success).toBe(false)
    expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith({
      where: { id: 'audit-mcp' },
      data: { firebaseCleanupUids: { push: 'new-fallback' } }
    })
    const recorded = prismaMock.userDeleteAuditLog.update.mock.calls.findIndex(
      ([args]) => JSON.stringify(args.data).includes('new-fallback')
    )
    expect(
      prismaMock.userDeleteAuditLog.update.mock.invocationCallOrder[recorded]
    ).toBeLessThan(retire.mock.invocationCallOrder[1])
    expect(prismaMock.userDeleteAuditLog.update).not.toHaveBeenCalledWith({
      where: { id: 'audit-mcp' },
      data: { retiredFirebaseUids: { push: 'new-fallback' } }
    })
    expect(mockDeleteUser).toHaveBeenCalledExactlyOnceWith('fb-uid-1')
    expect(
      retire.mock.calls.map((call) => JSON.parse(String(call[1].body)))
    ).toEqual([{ userId: 'fb-uid-1' }, { userId: 'new-fallback' }])
  })

  it('retires an email-reconciled Firebase identity before the fallback delete', async () => {
    const retire = vi
      .fn()
      .mockImplementation(async () => Response.json({ status: 'complete' }))
    vi.stubGlobal('fetch', retire)
    mockDeleteUser
      .mockRejectedValueOnce({ code: 'auth/user-not-found' })
      .mockResolvedValueOnce(undefined)
    mockGetUserByEmail.mockResolvedValueOnce({ uid: 'email-reconciled-uid' })
    const logs = await deleteFirebaseUser(
      'unknown-uid',
      null,
      'synthetic@example.com',
      true
    )
    expect(logs.some((log) => log.level === 'error')).toBe(false)
    expect(
      retire.mock.calls.map((call) => JSON.parse(String(call[1].body)))
    ).toEqual([{ userId: 'unknown-uid' }, { userId: 'email-reconciled-uid' }])
    expect(retire.mock.invocationCallOrder[1]).toBeLessThan(
      mockDeleteUser.mock.invocationCallOrder[1]
    )
  })
})
