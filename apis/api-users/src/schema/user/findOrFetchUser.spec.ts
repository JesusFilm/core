import { Mock, vi } from 'vitest'

import { Prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { prismaMock } from '../../../test/prismaMock'

import { UserEmailConflictError, findOrFetchUser } from './findOrFetchUser'
import { user } from './user.mock'
import { verifyUser } from './verifyUser'

const { defaultFirebaseUser } = vi.hoisted(() => ({
  defaultFirebaseUser: {
    id: '1',
    userId: '1',
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    displayName: 'Amin One',
    email: 'amin@email.com',
    photoURL: 'https://bit.ly/3Gth4',
    emailVerified: false
  }
}))

vi.mock('@core/yoga/firebaseClient', async () => ({
  ...(await vi.importActual('@core/yoga/firebaseClient')),
  auth: {
    getUser: vi.fn().mockReturnValue(defaultFirebaseUser)
  }
}))

vi.mock('./verifyUser', () => ({
  verifyUser: vi.fn()
}))

const firebaseUserNotFound = Object.assign(
  new Error(
    'There is no user record corresponding to the provided identifier.'
  ),
  { code: 'auth/user-not-found' }
)

// The relink only moves a row off a Firebase uid that no longer exists. The
// default getUser mock reports every uid as live, so a test that expects a
// guard to refuse MUST also call this: otherwise the old-uid check refuses
// with the same UserEmailConflictError and the guard under test could be
// deleted without the test noticing. Queue it right after mockFirebaseUser.
function mockPreviousUidGone(): void {
  ;(auth.getUser as Mock).mockRejectedValueOnce(firebaseUserNotFound)
}

describe('findOrFetchUser', () => {
  beforeEach(() => {
    // Drop any queued one-off getUser results a test left unconsumed (a
    // guard that refuses before reaching Firebase never reads them), so they
    // cannot leak into the next test and mask or fake a guard there.
    ;(auth.getUser as Mock).mockReset()
    ;(auth.getUser as Mock).mockReturnValue(defaultFirebaseUser)
  })

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

  it('should throw a typed conflict when syncing an existing user onto an email another row already holds', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      email: 'taken@email.com'
    })
    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    prismaMock.user.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '',
        meta: { target: ['email'] }
      })
    )

    await expect(findOrFetchUser({}, 'userId', undefined)).rejects.toThrow(
      UserEmailConflictError
    )
  })

  it('should throw a typed conflict when syncing onto an email a legacy mixed-case row of another user holds', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      email: 'Taken@Email.com'
    })
    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    // The unique index is case-sensitive, so lowercasing 'Taken@Email.com'
    // does not collide with a legacy 'Taken@Email.com' row; only the
    // case-insensitive lookup sees it.
    prismaMock.$queryRaw.mockResolvedValueOnce([{ id: 'legacyRowId' }])

    await expect(findOrFetchUser({}, 'userId', undefined)).rejects.toThrow(
      UserEmailConflictError
    )
    expect(prismaMock.user.update).not.toHaveBeenCalled()
    const [strings, ...values] = prismaMock.$queryRaw.mock
      .calls[0] as unknown as [TemplateStringsArray, ...unknown[]]
    expect(strings.join('?')).toContain('LOWER(email) = LOWER(?)')
    // Excludes the user's own row, so a user re-syncing their own email is
    // never in conflict with themselves.
    expect(strings.join('?')).toContain('"userId" <> ?')
    expect(values).toEqual(['taken@email.com', 'userId'])
  })

  it('should not look for another holder when the synced email is unchanged', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      emailVerified: true,
      email: user.email
    })
    prismaMock.user.findUnique.mockResolvedValueOnce(user)
    prismaMock.user.update.mockResolvedValueOnce({
      ...user,
      emailVerified: true
    })

    await findOrFetchUser({}, 'userId', undefined)

    expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
    expect(prismaMock.user.update).toHaveBeenCalledTimes(1)
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

  it('should normalize a mixed-case Firebase email before create', async () => {
    ;(auth.getUser as Mock).mockReturnValueOnce({
      id: '1',
      userId: '1',
      createdAt: new Date('2021-01-01T00:00:00.000Z'),
      displayName: 'Amin One',
      email: 'Amin@Email.com',
      photoURL: 'https://bit.ly/3Gth4',
      emailVerified: false
    })
    prismaMock.user.findUnique.mockResolvedValueOnce(null)
    prismaMock.user.create.mockResolvedValueOnce(user)

    await findOrFetchUser({}, 'userId', undefined)

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ email: 'amin@email.com' })
    })
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
      superAdmin: false
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

    it('should mark the raced row verified when Firebase confirms verification', async () => {
      mockFirebaseUser(true)
      const racedRow = { ...user, userId: newUid, emailVerified: false }
      const verifiedRacedRow = { ...racedRow, emailVerified: true }
      prismaMock.user.update.mockReset()
      prismaMock.user.update.mockResolvedValueOnce(verifiedRacedRow)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(racedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(verifiedRacedRow)
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { userId: newUid },
        data: { emailVerified: true, email }
      })
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('should not overwrite the raced row email when Firebase has none', async () => {
      ;(auth.getUser as Mock).mockReturnValueOnce({
        uid: newUid,
        displayName: 'Amin One',
        email: null,
        photoURL: 'https://bit.ly/3Gth4',
        emailVerified: true
      })
      const racedRow = { ...user, userId: newUid, emailVerified: false }
      const verifiedRacedRow = { ...racedRow, emailVerified: true }
      prismaMock.user.update.mockReset()
      prismaMock.user.update.mockResolvedValueOnce(verifiedRacedRow)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(racedRow)

      await findOrFetchUser({}, newUid, undefined)

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { userId: newUid },
        data: { emailVerified: true }
      })
    })

    it('should sync the email on an already-verified raced row when the email changed', async () => {
      mockFirebaseUser(true)
      const racedRow = {
        ...user,
        userId: newUid,
        emailVerified: true,
        email: 'old@email.com'
      }
      const syncedRow = { ...racedRow, email }
      prismaMock.user.update.mockReset()
      prismaMock.user.update.mockResolvedValueOnce(syncedRow)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(racedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(syncedRow)
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { userId: newUid },
        data: { emailVerified: true, email }
      })
    })

    it('should return the raced row unchanged when already verified and the email matches', async () => {
      mockFirebaseUser(true)
      const racedRow = { ...user, userId: newUid, emailVerified: true, email }
      prismaMock.user.update.mockReset()
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(racedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(racedRow)
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should throw a typed conflict when the raced row email sync collides with another row', async () => {
      mockFirebaseUser(true)
      const racedRow = { ...user, userId: newUid, emailVerified: false }
      prismaMock.user.update.mockReset()
      prismaMock.user.update.mockRejectedValueOnce(uniqueConstraintError)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(racedRow)

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
    })

    it('should throw a typed conflict when the raced row email sync hits a legacy mixed-case row of another user', async () => {
      mockFirebaseUser(true)
      const racedRow = {
        ...user,
        userId: newUid,
        email: 'older@email.com',
        emailVerified: true
      }
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.user.findUnique.mockResolvedValueOnce(racedRow)
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.$queryRaw.mockResolvedValueOnce([{ id: 'legacyRowId' }])

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should re-link the row holding a verified email to the new uid', async () => {
      mockFirebaseUser(true)
      mockPreviousUidGone()
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })
      const relinkedRow = { ...existingRow, userId: newUid }
      prismaMock.user.update.mockResolvedValueOnce(relinkedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(relinkedRow)
      // The Firebase staleness check must never run inside a transaction: it
      // is a network round-trip, and the update's own WHERE guard already
      // covers the concurrency case a transaction would.
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      })
      expect(auth.getUser).toHaveBeenLastCalledWith(oldUid)
      // Only the uid moves: the row keeps its id and the rest of its fields.
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: existingRow.id, userId: oldUid, email, superAdmin: false },
        data: { userId: newUid, emailVerified: true, email }
      })
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should guard the relink against the holder email changing between read and write', async () => {
      mockFirebaseUser(true)
      mockPreviousUidGone()
      // The holder's own sync (e.g. a later Firebase read) changes this
      // row's email between our read and the relink write, so the `email`
      // guard on the update must lose the race rather than overwrite it.
      // The default "no row relinked it either" fallback applies, so no
      // override is needed beyond the base email-match implementation.
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })
      prismaMock.user.update.mockRejectedValueOnce(recordNotFoundError)

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toBe(
        recordNotFoundError
      )
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: existingRow.id, userId: oldUid, email, superAdmin: false },
        data: { userId: newUid, emailVerified: true, email }
      })
    })

    it('should raise the typed conflict when the relink write loses an email race', async () => {
      mockFirebaseUser(true)
      mockPreviousUidGone()
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })
      // Another row took the normalized email between the collision check
      // and the write, so the update raises a raw unique-constraint error.
      prismaMock.user.update.mockRejectedValueOnce(uniqueConstraintError)

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
    })

    it('should return the row a concurrent call claimed for the new uid when the relink write hits the uid constraint', async () => {
      mockFirebaseUser(true)
      mockPreviousUidGone()
      const claimedRow = { ...user, id: 'claimedRowId', userId: newUid }
      // Calls, in order: existingUser (by userId, none), racedUser (by
      // userId, none), emailHolder (by email), the relink's holder read (by
      // email), then the post-failure lookup by userId finds the row the
      // concurrent call created for this uid.
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingRow)
        .mockResolvedValueOnce(existingRow)
        .mockResolvedValueOnce(claimedRow)
      prismaMock.user.update.mockRejectedValueOnce(uniqueConstraintError)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(claimedRow)
      expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
        where: { userId: newUid }
      })
    })

    it('should return the already re-linked row when the holder lookup races a concurrent relink', async () => {
      mockFirebaseUser(true)
      const relinkedRow = { ...existingRow, userId: newUid }
      // A concurrent call already relinked this exact email and normalized
      // the row's email to lowercase as part of that write, so this lookup
      // by the original (pre-normalization) string finds nothing. Calls, in
      // order: findOrFetchUser's existingUser (by userId),
      // resolveCreateConflict's racedUser (by userId), its emailHolder
      // (by email), then the relink's own holder read (by email, raced
      // away), then its relinkedByOtherCall fallback (by userId).
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingRow)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(relinkedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(relinkedRow)
      expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(4, {
        where: { email }
      })
      expect(prismaMock.user.findUnique).toHaveBeenNthCalledWith(5, {
        where: { userId: newUid }
      })
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should rethrow when the holder email disappeared and no row was relinked for this uid', async () => {
      mockFirebaseUser(true)
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingRow)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        'User row holding the email disappeared during re-link'
      )
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should refuse to re-link when the old uid is still a live Firebase account', async () => {
      mockFirebaseUser(true)
      // Both Firebase accounts exist with the same verified email.
      ;(auth.getUser as Mock).mockReturnValueOnce({
        uid: oldUid,
        email,
        emailVerified: true,
        disabled: false
      })
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
      expect(auth.getUser).toHaveBeenLastCalledWith(oldUid)
      expect(prismaMock.user.update).not.toHaveBeenCalled()
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should refuse to re-link when the old uid is a disabled Firebase account', async () => {
      mockFirebaseUser(true)
      ;(auth.getUser as Mock).mockReturnValueOnce({
        uid: oldUid,
        email,
        emailVerified: true,
        disabled: true
      })
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should not re-link when Firebase cannot say whether the old uid exists', async () => {
      mockFirebaseUser(true)
      const outage = Object.assign(new Error('network unavailable'), {
        code: 'app/network-error'
      })
      ;(auth.getUser as Mock).mockRejectedValueOnce(outage)
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return existingRow as never
        return null as never
      })

      // Fails closed with the original error, not as "stale".
      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        outage
      )
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should refuse to re-link a superAdmin row', async () => {
      mockFirebaseUser(true)
      mockPreviousUidGone()
      const superAdminRow = { ...existingRow, superAdmin: true }
      prismaMock.user.findUnique.mockImplementation((args) => {
        if (args.where.email === email) return superAdminRow as never
        return null as never
      })

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
      expect(prismaMock.user.update).not.toHaveBeenCalled()
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should return the already re-linked row when a parallel relink wins the race', async () => {
      mockFirebaseUser(true)
      mockPreviousUidGone()
      const relinkedRow = { ...existingRow, userId: newUid }
      // This call still sees the row on oldUid, but a parallel relink
      // commits first, so our own guarded update matches no row. Calls, in
      // order: findOrFetchUser's existingUser (by userId), racedUser (by
      // userId), emailHolder (by email), the relink's own holder read (by
      // email), then the relinkedByOtherCall fallback (by userId) after the
      // update loses the race.
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingRow)
        .mockResolvedValueOnce(existingRow)
        .mockResolvedValueOnce(relinkedRow)
      prismaMock.user.update.mockRejectedValueOnce(recordNotFoundError)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(relinkedRow)
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
        where: { userId: newUid }
      })
    })

    it('should return the row unchanged when a concurrent call already re-linked it', async () => {
      mockFirebaseUser(true)
      const relinkedRow = { ...existingRow, userId: newUid }
      // Calls, in order: findOrFetchUser's existingUser (by userId, none),
      // racedUser (by userId, none), emailHolder (by email, already shows
      // the relinked row), then the relink's own holder read (by email)
      // which sees holder.userId already equal to the new uid.
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(relinkedRow)
        .mockResolvedValueOnce(relinkedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(relinkedRow)
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should refuse to re-link when the Firebase email is not verified', async () => {
      mockFirebaseUser(false)
      mockPreviousUidGone()
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
      mockPreviousUidGone()
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

  describe('when a legacy row has a different email case', () => {
    // The create path lowercases the email, but the unique index is
    // case-sensitive: a legacy row stored as 'Amin@Email.com' would not
    // collide with a create for 'amin@email.com', producing a duplicate row
    // instead of relinking.
    const newUid = 'newFirebaseUid'
    const oldUid = 'oldFirebaseUid'
    const legacyEmail = 'Amin@Email.com'
    const legacyRow = {
      ...user,
      id: 'legacyRowId',
      userId: oldUid,
      email: legacyEmail,
      emailVerified: true,
      superAdmin: false
    }

    function mockFirebaseUser(emailVerified: boolean): void {
      ;(auth.getUser as Mock).mockReturnValueOnce({
        uid: newUid,
        displayName: 'Amin One',
        email: legacyEmail,
        photoURL: 'https://bit.ly/3Gth4',
        emailVerified
      })
    }

    beforeEach(() => {
      vi.mocked(verifyUser).mockClear()
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
    })

    it('should relink the legacy row instead of creating a duplicate', async () => {
      mockFirebaseUser(true)
      mockPreviousUidGone()
      // First $queryRaw call is the initial case-insensitive lookup; second
      // is the relink's own other-holders check, which finds none.
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ email: legacyRow.email }])
        .mockResolvedValueOnce([])
      // The relink's own holder read (by legacyEmail) is the second overall
      // findUnique call; the first is the beforeEach's existingUser lookup.
      prismaMock.user.findUnique.mockResolvedValueOnce(legacyRow)
      const relinkedRow = {
        ...legacyRow,
        userId: newUid,
        email: 'amin@email.com'
      }
      prismaMock.user.update.mockResolvedValueOnce(relinkedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(relinkedRow)
      expect(data?.email).toBe('amin@email.com')
      expect(prismaMock.user.create).not.toHaveBeenCalled()
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: legacyEmail }
      })
      // The row matched case-insensitively but is still written back
      // lowercased, so it doesn't keep its legacy casing forever.
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: {
          id: legacyRow.id,
          userId: oldUid,
          email: legacyEmail,
          superAdmin: false
        },
        data: { userId: newUid, emailVerified: true, email: 'amin@email.com' }
      })
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should refuse to relink when a lowercase row already holds the normalized email', async () => {
      mockFirebaseUser(true)
      // Marks the old uid stale so the old-uid-liveness check can't mask a
      // missing collision guard: if the guard were removed, the relink would
      // proceed past staleness and the update would run, and the assertion
      // below would catch it.
      mockPreviousUidGone()
      // First $queryRaw call is the initial case-insensitive lookup; second
      // is the other-holders check inside the relink itself, which finds the
      // exact-lowercase row.
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ email: legacyRow.email }])
        .mockResolvedValueOnce([{ id: 'otherRowId' }])
      // Second call (beyond the beforeEach's existingUser lookup) is the
      // relink's own holder read.
      prismaMock.user.findUnique.mockResolvedValueOnce(legacyRow)

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should refuse to relink when a second, differently-cased legacy row also matches', async () => {
      // Two pre-existing legacy rows, 'Amin@Email.com' and 'AMIN@EMAIL.COM',
      // can coexist because the unique index on email is case-sensitive.
      // Whichever one the initial LIMIT 1 lookup happens to return must not
      // be relinked while the other, un-related duplicate is left behind.
      mockFirebaseUser(true)
      mockPreviousUidGone()
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ email: legacyRow.email }])
        .mockResolvedValueOnce([{ id: 'otherLegacyRowId' }])
      prismaMock.user.findUnique.mockResolvedValueOnce(legacyRow)

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should refuse to relink the legacy row when Firebase has not verified the email', async () => {
      mockFirebaseUser(false)
      mockPreviousUidGone()
      prismaMock.$queryRaw.mockResolvedValueOnce([{ email: legacyRow.email }])

      await expect(findOrFetchUser({}, newUid, undefined)).rejects.toThrow(
        UserEmailConflictError
      )
      expect(prismaMock.user.create).not.toHaveBeenCalled()
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should return the row a concurrent call just created for the same uid instead of reporting a conflict', async () => {
      mockFirebaseUser(false)
      // The case-insensitive lookup finds the unverified row a parallel `me`
      // call created for this very uid. That is not another account's email,
      // so it must not surface as USER_EMAIL_CONFLICT.
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { email: 'amin@email.com', userId: newUid }
      ])
      const racedRow = {
        ...legacyRow,
        userId: newUid,
        email: 'amin@email.com',
        emailVerified: false
      }
      prismaMock.user.create.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '',
          meta: { target: ['userId'] }
        })
      )
      prismaMock.user.findUnique.mockResolvedValueOnce(racedRow)

      const data = await findOrFetchUser({}, newUid, undefined)

      expect(data).toEqual(racedRow)
      expect(prismaMock.user.update).not.toHaveBeenCalled()
      expect(verifyUser).not.toHaveBeenCalled()
    })

    it('should fall through to create when no row matches case-insensitively', async () => {
      mockFirebaseUser(true)
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.user.create.mockResolvedValueOnce({
        ...legacyRow,
        userId: newUid
      })

      await findOrFetchUser({}, newUid, undefined)

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'amin@email.com' })
      })
    })

    it('should match the holder by case-insensitive email without wildcard escaping', async () => {
      // `%` and `_` are valid, unescaped RFC-5322 local-part characters.
      // They would be ILIKE wildcards, but the lookup is now a plain
      // LOWER(email) = LOWER($1) equality predicate, which treats them as
      // literal characters -- no escaping needed, and no risk of
      // 'jane_doe@x.com' matching an unrelated row like 'janeXdoe@x.com'.
      ;(auth.getUser as Mock).mockReturnValueOnce({
        uid: newUid,
        displayName: 'Jane Doe',
        email: 'jane_doe@x.com',
        photoURL: 'https://bit.ly/3Gth4',
        emailVerified: true
      })
      prismaMock.$queryRaw.mockResolvedValueOnce([])
      prismaMock.user.create.mockResolvedValueOnce({
        ...legacyRow,
        userId: newUid,
        email: 'jane_doe@x.com'
      })

      await findOrFetchUser({}, newUid, undefined)

      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1)
      const [strings] = prismaMock.$queryRaw.mock.calls[0] as unknown as [
        TemplateStringsArray
      ]
      // Legacy rows can differ only by case; the pick must not be arbitrary.
      expect(strings.join('?')).toContain('ORDER BY "createdAt" ASC, id ASC')
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ email: 'jane_doe@x.com' })
      })
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
