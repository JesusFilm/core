import { prismaMock } from '../../../test/prismaMock'

import { findOrFetchUser } from './findOrFetchUser'
import { user } from './user.mock'
import { verifyUser } from './verifyUser'

jest.mock('@core/yoga/firebaseClient', () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      id: '1',
      userId: '1',
      createdAt: new Date('2021-01-01T00:00:00.000Z'),
      displayName: 'Amin One',
      email: 'amin@email.com',
      photoURL: 'https://bit.ly/3Gth4',
      emailVerified: false,
      providerData: [{ providerId: 'google.com' }]
    })
  }
}))

jest.mock('./verifyUser', () => ({
  verifyUser: jest.fn()
}))

describe('findOrFetchUser', () => {
  it('should find existing user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined)
    expect(data).toEqual(user)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { userId: 'userId' }
    })
  })

  it('should update emailverified on existing user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      ...user,
      emailVerified: null
    } as unknown as typeof user)
    prismaMock.user.update.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined)
    expect(data).toEqual(user)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId: 'userId' },
      data: { emailVerified: false }
    })
  })

  it('should create new user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined)
    expect(data).toEqual(user)
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'amin@email.com',
        emailVerified: false,
        firstName: 'Amin',
        imageUrl: 'https://bit.ly/3Gth4',
        lastName: 'One',
        userId: 'userId'
      }
    })
    expect(verifyUser).toHaveBeenCalledWith(
      'userId',
      'amin@email.com',
      undefined
    )
  })

  it('should return null and not create database user for anonymous Firebase user', async () => {
    const { auth } = await import('@core/yoga/firebaseClient')
    ;(auth.getUser as jest.Mock).mockResolvedValueOnce({
      id: 'anon',
      userId: 'anonymousUserId',
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: false,
      providerData: []
    })
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    const data = await findOrFetchUser({}, 'anonymousUserId', undefined)
    expect(data).toBeNull()
    expect(prismaMock.user.create).not.toHaveBeenCalled()
  })

  it('should return existing user when create fails (e.g. concurrent create)', async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(user)
    prismaMock.user.create.mockRejectedValueOnce(new Error('Unique constraint'))
    const data = await findOrFetchUser({}, 'userId', undefined)
    expect(data).toEqual(user)
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1)
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(2)
  })

  it('should create database user for anonymous Firebase user when forceCreateForAnonymous is true', async () => {
    const { auth } = await import('@core/yoga/firebaseClient')
    ;(auth.getUser as jest.Mock).mockResolvedValueOnce({
      id: 'anon',
      userId: 'anonymousUserId',
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: false,
      providerData: []
    })
    const createdUser = {
      ...user,
      userId: 'anonymousUserId',
      firstName: 'Unknown User',
      lastName: '',
      email: null,
      emailVerified: false
    }
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(
      createdUser as unknown as typeof user
    )
    const data = await findOrFetchUser({}, 'anonymousUserId', undefined, {
      forceCreateForAnonymous: true
    })
    expect(data).toEqual(createdUser)
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        userId: 'anonymousUserId',
        firstName: 'Unknown User',
        lastName: '',
        email: null,
        imageUrl: null,
        emailVerified: false
      }
    })
  })
})
