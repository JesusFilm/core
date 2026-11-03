import { Mock, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'

import { Prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { prismaMock } from '../../../test/prismaMock'

import { UserEmailConflictError, findOrFetchUser } from './findOrFetchUser'
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
    vi.mocked(verifyUser).mockClear()
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(user)
    const data = await findOrFetchUser({}, 'userId', undefined)
    expect(data).toEqual(user)
    expect(prismaMock.user.update).not.toHaveBeenCalled()
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
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

  describe('when create hits a unique constraint', () => {
    // A user whose Firebase uid changed (e.g. re-created by the January 2026
    // Okta bulk load) has no row for the new uid, while an older row with a
    // different uid still holds the same email.
    const newUid = 'newFirebaseUid'
    const oldUid = 'oldFirebaseUid'
    const email = 'amin@email.com'
    const existingRow = {
      ...user,
      id: 'userRecordId',
      userId: oldUid,
      email,
      emailVerified: true,
      superAdmin: true
    }

    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      { code: 'P2002', clientVersion: '', meta: { target: ['email'] } }
    )
    const recordNotFoundError = new Prisma.PrismaClientKnownRequestError(
      'Record to update not found',
      { code: 'P2025', clientVersion: '' }
    )

    function mockFirebaseUser(emailVerified: boolean): void {
      ;(auth.getUser as Mock).mockReturnValueOnce({
        uid: newUid,
        displayName: 'Amin One',
        email,
        photoURL: 'https://bit.ly/3Gth4',
        emailVerified
      })
    }

    // Mirrors the database: there is no row keyed to the new uid, so an
    // update by that uid fails exactly as it does in production.
    function mockNoRowForNewUid(): void {
      prismaMock.user.update.mockImplementation((args) => {
        if (args.where.userId === newUid) throw recordNotFoundError
        return undefined as never
      })
    }

    function mockTransaction(): ReturnType<
      typeof mockDeep<Prisma.TransactionClient>
    > {
      const tx = mockDeep<Prisma.TransactionClient>()
      prismaMock.$transaction.mockImplementation(
        async (callback: unknown) =>
          await (callback as (tx: Prisma.TransactionClient) => unknown)(tx)
      )
      return tx
    }

    beforeEach(() => {
      vi.mocked(verifyUser).mockClear()
      prismaMock.user.create.mockRejectedValue(uniqueConstraintError)
      mockNoRowForNewUid()
    })

    it('should return the row a concurrent call created for the same uid', async () => {
      mockFirebaseUser(false)
      const racedRow = { ...user, userId: newUid }
      // The concurrent call's row exists, so an update by uid would succeed;
      // re-reading it is what we want, not overwriting it.
      prismaMock.user.update.mockReset()
      prismaMock.user.update.mockResolvedValue(racedRow)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(racedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(racedRow)
      expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
        where: { userId: newUid }
      })
      expect(prismaMock.user.update).not.toHaveBeenCalled()
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should re-link the row holding a verified email to the new uid', async () => {
      mockFirebaseUser(true)
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })
      const tx = mockTransaction()
      tx.user.findUnique.mockResolvedValueOnce(existingRow)
      const relinkedRow = { ...existingRow, userId: newUid }
      tx.user.update.mockResolvedValueOnce(relinkedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(relinkedRow)
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(tx.user.findUnique).toHaveBeenCalledWith({ where: { email } })
      // Only the uid moves: the row keeps its id, so superAdmin and every
      // other field on it stay intact.
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: existingRow.id, userId: oldUid },
        data: { userId: newUid, emailVerified: true }
      })
      expect(prismaMock.user.update).not.toHaveBeenCalled()
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should return the row unchanged when a concurrent call already re-linked it', async () => {
      mockFirebaseUser(true)
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })
      const tx = mockTransaction()
      const relinkedRow = { ...existingRow, userId: newUid }
      tx.user.findUnique.mockResolvedValueOnce(relinkedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(relinkedRow)
      expect(tx.user.update).not.toHaveBeenCalled()
    })

    it('should refuse to re-link when the Firebase email is not verified', async () => {
      mockFirebaseUser(false)
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.user.update).not.toHaveBeenCalled()
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should expose the conflict as a typed GraphQL error code', async () => {
      mockFirebaseUser(false)
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })

      await expect(
        findOrFetchUser({}, newUid, undefined)
      ).rejects.toMatchObject({ extensions: { code: 'USER_EMAIL_CONFLICT' } })
    })

    it('should rethrow the constraint error when no row explains it', async () => {
      mockFirebaseUser(true)
      prismaMock.user.findUnique.mockResolvedValue(null)

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toBe(
        uniqueConstraintError
      )
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
  })

  it('should rethrow errors from create that are not unique-constraint errors', async () => {
    const connectionError = new Error('connection refused')
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockRejectedValueOnce(connectionError)

    await expect(findOrFetchUser({}, 'userId', undefined)).rejects.toBe(
      connectionError
    )
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})
