import { prismaMock } from '../../../../test/prismaMock'

import { deleteFirebaseOnlyAccount } from './deleteFirebaseOnlyAccount'

const mockDeleteUser = jest.fn()
const mockGetUserByEmail = jest.fn()

jest.mock('@core/yoga/firebaseClient', () => ({
  auth: {
    deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
    getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args)
  }
}))

const baseInput = {
  targetFirebaseUid: 'fb-target-1',
  targetEmail: 'target@example.com',
  callerDbId: 'caller-db-1',
  callerEmail: 'caller@example.com',
  callerFirebaseUid: 'fb-target-1', // same as target = self-delete
  callerIsSuperAdmin: false
}

describe('deleteFirebaseOnlyAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('self-delete guard', () => {
    it('should allow a non-superAdmin to delete their own account', async () => {
      prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
        id: 'audit-1'
      } as any)
      mockDeleteUser.mockResolvedValueOnce(undefined)
      prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

      const result = await deleteFirebaseOnlyAccount(baseInput)

      expect(result.success).toBe(true)
    })

    it('should forbid a non-superAdmin from deleting another account', async () => {
      const result = await deleteFirebaseOnlyAccount({
        ...baseInput,
        callerFirebaseUid: 'fb-other-caller',
        callerIsSuperAdmin: false
      })

      expect(result.success).toBe(false)
      expect(result.logs.some((l) => l.level === 'error')).toBe(true)
      expect(result.logs[0].message).toContain('Forbidden')
      // No DB or Firebase calls should be made
      expect(prismaMock.userDeleteAuditLog.create).not.toHaveBeenCalled()
      expect(mockDeleteUser).not.toHaveBeenCalled()
    })

    it('should allow a superAdmin to delete any account', async () => {
      prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
        id: 'audit-1'
      } as any)
      mockDeleteUser.mockResolvedValueOnce(undefined)
      prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

      const result = await deleteFirebaseOnlyAccount({
        ...baseInput,
        callerFirebaseUid: 'fb-different-admin',
        callerIsSuperAdmin: true
      })

      expect(result.success).toBe(true)
      expect(mockDeleteUser).toHaveBeenCalledWith('fb-target-1')
    })
  })

  describe('audit log', () => {
    it('should create audit log with both deletedUserId and deletedUserFirebaseUid', async () => {
      prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
        id: 'audit-1'
      } as any)
      mockDeleteUser.mockResolvedValueOnce(undefined)
      prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

      await deleteFirebaseOnlyAccount(baseInput)

      expect(prismaMock.userDeleteAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedUserId: 'fb-target-1',
            deletedUserFirebaseUid: 'fb-target-1',
            callerUserId: 'caller-db-1',
            callerEmail: 'caller@example.com'
          })
        })
      )
    })

    it('should abort if audit log creation fails', async () => {
      prismaMock.userDeleteAuditLog.create.mockRejectedValueOnce(
        new Error('DB unavailable')
      )

      const result = await deleteFirebaseOnlyAccount(baseInput)

      expect(result.success).toBe(false)
      expect(result.logs.some((l) => l.level === 'error')).toBe(true)
      expect(mockDeleteUser).not.toHaveBeenCalled()
    })
  })

  describe('Firebase deletion', () => {
    it('should successfully delete Firebase account and update audit log', async () => {
      prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
        id: 'audit-1'
      } as any)
      mockDeleteUser.mockResolvedValueOnce(undefined)
      prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

      const result = await deleteFirebaseOnlyAccount(baseInput)

      expect(result.success).toBe(true)
      expect(mockDeleteUser).toHaveBeenCalledWith('fb-target-1')
      expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ success: true })
        })
      )
    })

    it('should return success false on Firebase hard error and update audit log', async () => {
      prismaMock.userDeleteAuditLog.create.mockResolvedValueOnce({
        id: 'audit-1'
      } as any)
      mockDeleteUser.mockRejectedValueOnce(new Error('Firebase down'))
      prismaMock.userDeleteAuditLog.update.mockResolvedValueOnce({} as any)

      const result = await deleteFirebaseOnlyAccount(baseInput)

      expect(result.success).toBe(false)
      expect(prismaMock.userDeleteAuditLog.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            success: false,
            errorMessage: 'Firebase deletion failed'
          })
        })
      )
    })
  })
})
