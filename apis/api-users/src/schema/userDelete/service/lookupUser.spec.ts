import { GraphQLError } from 'graphql'

import { prismaMock } from '../../../../test/prismaMock'

import { lookupUser } from './lookupUser'

const mockGetUser = jest.fn()
const mockGetUserByEmail = jest.fn()

jest.mock('@core/yoga/firebaseClient', () => ({
  auth: {
    getUser: (...args: unknown[]) => mockGetUser(...args),
    getUserByEmail: (...args: unknown[]) => mockGetUserByEmail(...args)
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
    jest.clearAllMocks()
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
    prismaMock.user.findUnique.mockResolvedValueOnce(mockUser as any)
    mockGetUser.mockResolvedValueOnce({
      uid: 'firebase-uid-1',
      email: 'john@example.com',
      disabled: false,
      providerData: []
    })

    const result = await lookupUser('databaseId', 'db-id-1')

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'db-id-1' }
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
    prismaMock.user.findUnique.mockResolvedValueOnce(null)

    await expect(lookupUser('databaseId', 'nonexistent-id')).rejects.toThrow(
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
})
