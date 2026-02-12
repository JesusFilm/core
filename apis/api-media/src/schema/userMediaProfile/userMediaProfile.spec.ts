import { UserMediaProfile as PrismaUserMediaProfile } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('userMediaProfile', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  const publicClient = getClient()

  const USER_MEDIA_PROFILE_QUERY = graphql(`
    query UserMediaProfile {
      userMediaProfile {
        id
        userId
        countryInterests
      }
    }
  `)

  const USER_MEDIA_PROFILE_UPDATE_MUTATION = graphql(`
    mutation UserMediaProfileUpdate($input: UserMediaProfileUpdateInput!) {
      userMediaProfileUpdate(input: $input) {
        id
        userId
        countryInterests
      }
    }
  `)

  beforeEach(() => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'testUserId',
      userId: 'testUserId',
      roles: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })

  describe('userMediaProfile query', () => {
    it('returns the profile for the authenticated user', async () => {
      const mockProfile: PrismaUserMediaProfile = {
        id: 'profile-id',
        userId: 'testUserId',
        languageInterestIds: [],
        countryInterestIds: ['US', 'GB'],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.userMediaProfile.findUnique.mockResolvedValue(mockProfile)

      const result = await authClient({
        document: USER_MEDIA_PROFILE_QUERY
      })

      expect(prismaMock.userMediaProfile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' }
        })
      )
      expect(result).toHaveProperty('data.userMediaProfile.id', 'profile-id')
      expect(result).toHaveProperty(
        'data.userMediaProfile.userId',
        'testUserId'
      )
      expect(result).toHaveProperty('data.userMediaProfile.countryInterests', [
        'US',
        'GB'
      ])
    })

    it('creates profile when it does not exist', async () => {
      const createdProfile: PrismaUserMediaProfile = {
        id: 'new-profile-id',
        userId: 'testUserId',
        languageInterestIds: [],
        countryInterestIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.userMediaProfile.findUnique.mockResolvedValue(null)
      prismaMock.userMediaProfile.upsert.mockResolvedValue(createdProfile)

      const result = await authClient({
        document: USER_MEDIA_PROFILE_QUERY
      })

      expect(prismaMock.userMediaProfile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' }
        })
      )
      expect(prismaMock.userMediaProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' },
          update: {},
          create: {
            userId: 'testUserId'
          }
        })
      )
      expect(result).toHaveProperty(
        'data.userMediaProfile.id',
        createdProfile.id
      )
      expect(result).toHaveProperty(
        'data.userMediaProfile.userId',
        createdProfile.userId
      )
    })

    it('returns error when not authenticated', async () => {
      const result = await publicClient({
        document: USER_MEDIA_PROFILE_QUERY
      })

      expect(
        (result as { data?: { userMediaProfile?: null } }).data
          ?.userMediaProfile
      ).toBeNull()
      expect(result).toHaveProperty('errors')
      expect(Array.isArray((result as { errors?: unknown[] }).errors)).toBe(
        true
      )
      expect(
        (result as { errors?: { message?: string }[] }).errors?.[0]
      ).toMatchObject({
        message: expect.stringContaining('Not authorized')
      })
    })
  })

  describe('userMediaProfileUpdate mutation', () => {
    it('updates profile with provided input', async () => {
      const updatedProfile: PrismaUserMediaProfile = {
        id: 'profile-id',
        userId: 'testUserId',
        languageInterestIds: ['529', '987'],
        countryInterestIds: ['CA'],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.userMediaProfile.upsert.mockResolvedValue(updatedProfile)

      const result = await authClient({
        document: USER_MEDIA_PROFILE_UPDATE_MUTATION,
        variables: {
          input: {
            languageInterestIds: ['529', '987'],
            countryInterestIds: ['CA'],
            userInterestIds: ['video-id-1', 'video-id-2']
          }
        } as never
      })

      expect(prismaMock.userMediaProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' },
          update: {
            languageInterestIds: ['529', '987'],
            countryInterestIds: ['CA'],
            userInterests: {
              set: [{ id: 'video-id-1' }, { id: 'video-id-2' }]
            }
          },
          create: {
            userId: 'testUserId',
            languageInterestIds: ['529', '987'],
            countryInterestIds: ['CA'],
            userInterests: {
              connect: [{ id: 'video-id-1' }, { id: 'video-id-2' }]
            }
          }
        })
      )
      expect(result).toHaveProperty(
        'data.userMediaProfileUpdate.countryInterests',
        ['CA']
      )
    })

    it('clears user interests when empty array is provided', async () => {
      const updatedProfile: PrismaUserMediaProfile = {
        id: 'profile-id',
        userId: 'testUserId',
        languageInterestIds: [],
        countryInterestIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.userMediaProfile.upsert.mockResolvedValue(updatedProfile)

      await authClient({
        document: USER_MEDIA_PROFILE_UPDATE_MUTATION,
        variables: {
          input: { userInterestIds: [] }
        } as never
      })

      expect(prismaMock.userMediaProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' },
          update: {
            userInterests: { set: [] }
          },
          create: {
            userId: 'testUserId',
            userInterests: { connect: [] }
          }
        })
      )
    })

    it('updates only provided fields', async () => {
      const updatedProfile: PrismaUserMediaProfile = {
        id: 'profile-id',
        userId: 'testUserId',
        languageInterestIds: ['529'],
        countryInterestIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.userMediaProfile.upsert.mockResolvedValue(updatedProfile)

      await authClient({
        document: USER_MEDIA_PROFILE_UPDATE_MUTATION,
        variables: {
          input: { languageInterestIds: ['529'] }
        } as never
      })

      expect(prismaMock.userMediaProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' },
          update: { languageInterestIds: ['529'] },
          create: {
            userId: 'testUserId',
            languageInterestIds: ['529']
          }
        })
      )
    })

    it('returns error when not authenticated', async () => {
      const result = await publicClient({
        document: USER_MEDIA_PROFILE_UPDATE_MUTATION,
        variables: { input: {} } as never
      })

      expect((result as { data?: unknown }).data).toBeNull()
      expect(result).toHaveProperty('errors')
      expect(
        (result as { errors?: { message?: string }[] }).errors?.[0].message
      ).toContain('Not authorized')
    })
  })
})
