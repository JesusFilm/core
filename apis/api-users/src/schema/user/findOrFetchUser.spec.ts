import { UserRecord } from 'firebase-admin/auth'
import omit from 'lodash/omit'

import { User } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { prismaMock } from '../../../test/prismaMock'
import { Context } from '../builder'

import { findOrFetchUser } from './findOrFetchUser'
import { user } from './user.mock'
import { verifyUser } from './verifyUser'

jest.mock('@core/yoga/firebaseClient', () => ({
  auth: {
    getUser: jest.fn().mockReturnValue({
      id: '1',
      userId: '1',
      createdAt: new Date('2021-01-01T00:00:00.000Z'),
      displayName: 'Amin One',
      email: 'amin@email.com',
      photoURL: 'https://bit.ly/3Gth4',
      emailVerified: false
    })
  }
}))

jest.mock('./verifyUser', () => ({
  verifyUser: jest.fn()
}))
const mockContext: Extract<Context, { type: 'authenticated' }> = {
  type: 'authenticated',
  currentUser: {
    id: 'userId',
    email: 'amin@email.com',
    firstName: 'Amin',
    emailVerified: false
  }
}

describe('findOrFetchUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should find existing user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined, mockContext)
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
    const data = await findOrFetchUser({}, 'userId', undefined, mockContext)
    expect(data).toEqual(user)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'userId' },
      data: { emailVerified: false }
    })
  })

  it('should create new user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined, mockContext)
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

  it('should send verification email to user if existing user email gets updated', async () => {
    const userWithoutEmail = omit(
      { ...user, email: null },
      'emailVerified'
    ) as User

    prismaMock.user.findUnique.mockResolvedValueOnce(userWithoutEmail)
    prismaMock.user.update.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined, mockContext)
    expect(data).toEqual(user)
    expect(verifyUser).toHaveBeenCalledWith(
      'userId',
      'amin@email.com',
      undefined
    )
  })

  it('should not send verification email to user if they are anonymous', async () => {
    const userWithoutEmail = omit(
      { ...user, email: null },
      'emailVerified'
    ) as User

    const contextWithoutEmail = {
      ...mockContext,
      currentUser: {
        ...mockContext.currentUser,
        email: null
      }
    }

    prismaMock.user.findUnique.mockResolvedValueOnce(userWithoutEmail)
    prismaMock.user.update.mockResolvedValueOnce(user)
    const data = await findOrFetchUser(
      {},
      'userId',
      undefined,
      contextWithoutEmail
    )
    expect(data).toEqual(user)
    expect(verifyUser).not.toHaveBeenCalled()
  })

  it('should not send verification email to user after anonymous user creation', async () => {
    jest.spyOn(auth, 'getUser').mockImplementationOnce(
      async () =>
        await Promise.resolve({
          id: '1',
          userId: '1',
          createdAt: new Date('2021-01-01T00:00:00.000Z'),
          displayName: 'Amin One',
          email: null,
          photoURL: 'https://bit.ly/3Gth4',
          emailVerified: false
        } as unknown as UserRecord)
    )

    const userWithoutEmail = omit(
      { ...user, email: null },
      'emailVerified'
    ) as User

    const mockPublicContext: Extract<Context, { type: 'public' }> = {
      type: 'public'
    }

    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(userWithoutEmail)
    const data = await findOrFetchUser(
      {},
      'userId',
      undefined,
      mockPublicContext
    )
    expect(data).toEqual(userWithoutEmail)
    expect(verifyUser).not.toHaveBeenCalled()
  })
})
