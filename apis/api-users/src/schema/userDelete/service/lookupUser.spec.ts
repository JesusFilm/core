import { GraphQLError } from 'graphql'

import { prismaMock } from '../../../../test/prismaMock'

import { lookupUser } from './lookupUser'

const mockGetUser = jest.fn()
const mockGetUserByEmail = jest.fn()
const mockVerifyIdToken = jest.fn()

jest.mock('@core/yoga/firebaseClient', () => ({
  auth: {
    getUser: (...args: unknown[]) => mockGetUser(...args),
    getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args),
    verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args)
  }
}))

const mockUser = {
  id: 'db-id-1',
  userId: 'firebase-uid-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  imageUrl: null,
  superAdmin: false,
  emailVerified: true,
  createdAt: new Date()
}

describe('lookupUser', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockGetUserByEmail.mockReset()
    mockVerifyIdToken.mockReset()
  })

  it('should find user by email with firebase by UID', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(mockUser as any)
    mockGetUser.mockResolvedValueOnce({
      uid: 'firebase-uid-1',
      email: 'john@example.com',
      disabled: false,
      providerData: [{ providerId: 'google.com' }]
    })

    const result = await lookupUser('email', 'john@example.com')

    expect(result.user).toEqual(mockUser)
    expect(result.firebase.exists).toBe(true)
    expect(result.firebase.uid).toBe('firebase-uid-1')
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'john@example.com' }
    })
  })

  it('should find user by databaseId', async () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174001'
    prismaMock.user.findUnique.mockResolvedValueOnce(mockUser as any)
    mockGetUser.mockResolvedValueOnce({
      uid: 'firebase-uid-1',
      email: 'john@example.com',
      disabled: false,
      providerData: []
    })

    const result = await lookupUser('databaseId', validUuid)

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: validUuid }
    })
    expect(result.user).toEqual(mockUser)
  })

  it('should fall back to firebase email lookup when UID not found', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(mockUser as any)
    mockGetUser.mockRejectedValueOnce({ code: 'auth/user-not-found' })
    mockGetUserByEmail.mockResolvedValueOnce({
      uid: 'different-uid',
      email: 'john@example.com',
      disabled: false,
      providerData: [{ providerId: 'password' }]
    })

    const result = await lookupUser('email', 'john@example.com')

    expect(result.firebase.exists).toBe(true)
    expect(result.firebase.uid).toBe('different-uid')
  })

  it('should return firebase-only when no DB user but firebase exists by email', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    mockGetUser.mockRejectedValueOnce({ code: 'auth/user-not-found' })
    mockGetUserByEmail.mockResolvedValueOnce({
      uid: 'orphan-uid',
      email: 'orphan@example.com',
      disabled: false,
      providerData: [{ providerId: 'google.com' }]
    })

    const result = await lookupUser('email', 'orphan@example.com')

    expect(result.user).toBeNull()
    expect(result.firebase.exists).toBe(true)
    expect(result.firebase.uid).toBe('orphan-uid')
  })

  it('should throw NOT_FOUND when no DB user and no firebase by email', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    mockGetUser.mockRejectedValueOnce({ code: 'auth/user-not-found' })
    mockGetUserByEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' })

    await expect(lookupUser('email', 'gone@example.com')).rejects.toThrow(
      GraphQLError
    )
  })

  it('should throw NOT_FOUND when no DB user by databaseId', async () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174002'
    prismaMock.user.findUnique.mockResolvedValueOnce(null)

    await expect(lookupUser('databaseId', validUuid)).rejects.toThrow(
      GraphQLError
    )
  })

  it('should report no firebase record when both UID and email fail', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(mockUser as any)
    mockGetUser.mockRejectedValueOnce({ code: 'auth/user-not-found' })
    mockGetUserByEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' })

    const result = await lookupUser('email', 'john@example.com')

    expect(result.user).toEqual(mockUser)
    expect(result.firebase.exists).toBe(false)
  })

  describe('jwt idType', () => {
    it('should find user by verified JWT token', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ uid: 'firebase-uid-1' })
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser as any)
      mockGetUser.mockResolvedValueOnce({
        uid: 'firebase-uid-1',
        email: 'john@example.com',
        disabled: false,
        providerData: [{ providerId: 'google.com' }]
      })

      const result = await lookupUser('jwt', 'valid-jwt-token')

      expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-jwt-token')
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 'firebase-uid-1' }
      })
      expect(result.user).toEqual(mockUser)
      expect(result.firebase.exists).toBe(true)
      expect(result.firebase.uid).toBe('firebase-uid-1')
    })

    it('should throw UNAUTHENTICATED when JWT is invalid', async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error('Token expired'))

      await expect(lookupUser('jwt', 'invalid-token')).rejects.toMatchObject({
        extensions: { code: 'UNAUTHENTICATED' }
      })
    })

    it('should return firebase-only when JWT resolves to UID with no DB user', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ uid: 'orphan-uid' })
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      mockGetUser.mockResolvedValueOnce({
        uid: 'orphan-uid',
        email: 'orphan@example.com',
        disabled: false,
        providerData: [{ providerId: 'password' }]
      })

      const result = await lookupUser('jwt', 'some-jwt-token')

      expect(result.user).toBeNull()
      expect(result.firebase.exists).toBe(true)
      expect(result.firebase.uid).toBe('orphan-uid')
    })

    it('should throw NOT_FOUND when JWT resolves to UID with no DB user and no Firebase auth', async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ uid: 'gone-uid' })
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      mockGetUser.mockRejectedValueOnce({ code: 'auth/user-not-found' })

      await expect(lookupUser('jwt', 'some-jwt-token')).rejects.toMatchObject({
        extensions: { code: 'NOT_FOUND' }
      })
    })
  })
})
