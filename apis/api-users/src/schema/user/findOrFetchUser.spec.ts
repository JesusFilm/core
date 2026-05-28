import { Mock, vi } from 'vitest'

import { auth } from '@core/yoga/firebaseClient'

import { prismaMock } from '../../../test/prismaMock'

import { findOrFetchUser } from './findOrFetchUser'
import { user } from './user.mock'
import { verifyUser } from './verifyUser'

vi.mock('@core/yoga/firebaseClient', async () => ({
  ...(await vi.importActual('@core/yoga/firebaseClient')),
  auth: {
    getUser: vi.fn().mockReturnValue({
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

vi.mock('./verifyUser', () => ({
  verifyUser: vi.fn()
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

  it('should sync emailVerified from Firebase when DB says false but Firebase says true', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true
    })

    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    const updatedUser = { ...user, emailVerified: true }
    prismaMock.user.update.mockResolvedValueOnce(updatedUser)

    const data = await findOrFetchUser({}, 'userId', undefined)
    expect(data).toEqual(updatedUser)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId: 'userId' },
      data: { emailVerified: true }
    })
  })

  it('should update profile fields when emailVerified transitions to true', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: 'https://photo.example.com/john.jpg'
    })

    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    const updatedUser = {
      ...user,
      emailVerified: true,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      imageUrl: 'https://photo.example.com/john.jpg'
    }
    prismaMock.user.update.mockResolvedValueOnce(updatedUser)

    const data = await findOrFetchUser({}, 'userId', undefined)
    expect(data).toEqual(updatedUser)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId: 'userId' },
      data: {
        emailVerified: true,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://photo.example.com/john.jpg'
      }
    })
  })

  it('should fall back to providerData when top-level displayName/photoURL are null', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      displayName: null,
      email: 'jane@example.com',
      photoURL: null,
      providerData: [
        {
          providerId: 'google.com',
          displayName: 'Jane Smith',
          photoURL: 'https://lh3.googleusercontent.com/a/photo'
        }
      ]
    })

    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    const updatedUser = {
      ...user,
      emailVerified: true,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      imageUrl: 'https://lh3.googleusercontent.com/a/photo'
    }
    prismaMock.user.update.mockResolvedValueOnce(updatedUser)

    const data = await findOrFetchUser({}, 'userId', undefined)
    expect(data).toEqual(updatedUser)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId: 'userId' },
      data: {
        emailVerified: true,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        imageUrl: 'https://lh3.googleusercontent.com/a/photo'
      }
    })
  })

  it('should accept non-whitelisted providers via providerData', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      displayName: null,
      email: 'user@icloud.com',
      photoURL: null,
      providerData: [
        {
          providerId: 'apple.com',
          displayName: 'Tim Apple',
          photoURL: 'https://appleid.cdn-apple.com/a/photo'
        }
      ]
    })

    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    prismaMock.user.update.mockResolvedValueOnce({
      ...user,
      emailVerified: true,
      firstName: 'Tim',
      lastName: 'Apple',
      email: 'user@icloud.com',
      imageUrl: 'https://appleid.cdn-apple.com/a/photo'
    })

    await findOrFetchUser({}, 'userId', undefined)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId: 'userId' },
      data: expect.objectContaining({
        firstName: 'Tim',
        lastName: 'Apple',
        imageUrl: 'https://appleid.cdn-apple.com/a/photo'
      })
    })
  })

  it('should reject non-https photoURL during conversion', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      displayName: 'Evil User',
      email: 'evil@example.com',
      photoURL: 'javascript:alert(1)'
    })

    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    prismaMock.user.update.mockResolvedValueOnce(user)

    await findOrFetchUser({}, 'userId', undefined)
    const updateCall = prismaMock.user.update.mock.calls[0][0]
    expect(updateCall.data).not.toHaveProperty('imageUrl')
  })

  it('should strip control characters from displayName during conversion', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      displayName: 'John‮Doe',
      email: 'john@example.com',
      photoURL: null
    })

    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    prismaMock.user.update.mockResolvedValueOnce(user)

    await findOrFetchUser({}, 'userId', undefined)
    const updateCall = prismaMock.user.update.mock.calls[0][0]
    // "John" and "Doe" concatenated after RLO strip become "JohnDoe" single token
    expect(updateCall.data).toMatchObject({
      firstName: 'JohnDoe',
      lastName: ''
    })
  })

  it('should preserve existing firstName/lastName when provider yields no displayName', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      displayName: null,
      email: null,
      photoURL: null
    })

    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    prismaMock.user.update.mockResolvedValueOnce({
      ...user,
      emailVerified: true
    })

    await findOrFetchUser({}, 'userId', undefined)
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { userId: 'userId' },
      data: { emailVerified: true }
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
      undefined,
      undefined
    )
  })

  it('should create anonymous user with null email', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      id: '1',
      userId: '1',
      createdAt: new Date('2021-01-01T00:00:00.000Z'),
      displayName: 'Anonymous',
      email: undefined,
      photoURL: 'https://bit.ly/3Gth4',
      emailVerified: false
    })
    vi.mocked(verifyUser).mockClear()

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
