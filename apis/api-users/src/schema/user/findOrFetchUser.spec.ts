import omit from 'lodash/omit'

import { User } from '@core/prisma/users/client'

import { prismaMock } from '../../../test/prismaMock'

import { CurrentUserFromCtx, findOrFetchUser } from './findOrFetchUser'
import { user } from './user.mock'
import { verifyUser } from './verifyUser'

jest.mock('./verifyUser', () => ({
  verifyUser: jest.fn()
}))
const mockCtxCurrentUser: CurrentUserFromCtx = {
  id: 'userId',
  email: 'amin@email.com',
  firstName: 'Amin',
  lastName: 'One',
  imageUrl: 'https://bit.ly/3Gth4',
  emailVerified: false
}

describe('findOrFetchUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should find existing user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    const data = await findOrFetchUser(
      {},
      'userId',
      undefined,
      mockCtxCurrentUser
    )
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
    const data = await findOrFetchUser(
      {},
      'userId',
      undefined,
      mockCtxCurrentUser
    )
    expect(data).toEqual(user)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'userId' },
      data: { emailVerified: false }
    })
  })

  it('should update user when converting from guest to registered', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.update.mockResolvedValueOnce(user)
    const data = await findOrFetchUser(
      {},
      'userId',
      undefined,
      mockCtxCurrentUser
    )
    expect(data).toEqual(user)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'userId' },
      data: {
        email: 'amin@email.com',
        firstName: 'Amin',
        lastName: 'One',
        imageUrl: 'https://bit.ly/3Gth4',
        emailVerified: false
      }
    })
    expect(verifyUser).toHaveBeenCalledWith(
      'userId',
      'amin@email.com',
      undefined
    )
  })

  it('should create new user when no context user provided', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined, undefined)
    expect(data).toEqual(user)
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: undefined,
        emailVerified: undefined,
        firstName: 'Unknown User',
        imageUrl: undefined,
        lastName: null,
        userId: 'userId'
      }
    })
    expect(verifyUser).not.toHaveBeenCalled()
  })

  it('should send verification email to user if existing user email gets updated', async () => {
    const userWithoutEmail = omit(
      { ...user, email: null },
      'emailVerified'
    ) as unknown as User

    prismaMock.user.findUnique.mockResolvedValueOnce(userWithoutEmail)
    prismaMock.user.update.mockResolvedValueOnce(user)
    const data = await findOrFetchUser(
      {},
      'userId',
      undefined,
      mockCtxCurrentUser
    )
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
    ) as unknown as User

    const contextWithoutEmail = {
      ...mockCtxCurrentUser,
      email: null
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
    const userWithoutEmail = omit(
      { ...user, email: null },
      'emailVerified'
    ) as unknown as User

    const mockPublicContext = undefined

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

  it('should update user with email and send verification email when context user has email but existing user has no email and emailVerified is false', async () => {
    const userWithoutEmail = {
      ...user,
      email: null,
      emailVerified: false
    } as unknown as User

    prismaMock.user.findUnique.mockResolvedValueOnce(userWithoutEmail)
    prismaMock.user.update.mockResolvedValueOnce(user)
    const data = await findOrFetchUser(
      {},
      'userId',
      undefined,
      mockCtxCurrentUser
    )
    expect(data).toEqual(user)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'userId' },
      data: {
        email: 'amin@email.com',
        firstName: 'Amin',
        lastName: 'One',
        imageUrl: 'https://bit.ly/3Gth4',
        emailVerified: false
      }
    })
    expect(verifyUser).toHaveBeenCalledWith(
      'userId',
      'amin@email.com',
      undefined
    )
  })
})
