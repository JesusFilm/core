import { prismaMock } from '../../../test/prismaMock'

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
      where: { userid: 'userId' },
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
      undefined,
      undefined
    )
  })

  it('should create anonymous user with null email', async () => {
    const { auth } = jest.requireMock('@core/yoga/firebaseClient')
    auth.getUser.mockReturnValueOnce({
      id: '1',
      userId: '1',
      createdAt: new Date('2021-01-01T00:00:00.000Z'),
      displayName: 'Anonymous',
      email: undefined,
      photoURL: 'https://bit.ly/3Gth4',
      emailVerified: false
    })
    jest.mocked(verifyUser).mockClear()

    const anonymousUser = {
      ...user,
      email: null,
      firstName: 'Anonymous',
      lastName: ''
    }
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(anonymousUser)

    const data = await findOrFetchUser({}, 'userId', undefined)

    expect(data).toEqual(anonymousUser)
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: null,
        emailVerified: false,
        firstName: 'Anonymous',
        imageUrl: 'https://bit.ly/3Gth4',
        lastName: '',
        userId: 'userId'
      }
    })
    expect(verifyUser).not.toHaveBeenCalled()
  })

  it('should allow verification email to be sent on a per app basis', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined, 'JesusFilmOne')
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
      undefined,
      'JesusFilmOne'
    )
  })

  it('should pass app type when provided', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined, 'NextSteps')
    expect(data).toEqual(user)
    expect(verifyUser).toHaveBeenCalledWith(
      'userId',
      'amin@email.com',
      undefined,
      'NextSteps'
    )
  })
})
