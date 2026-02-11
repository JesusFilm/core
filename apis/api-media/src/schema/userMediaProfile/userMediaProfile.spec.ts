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

  const USER_MEDIA_PROFILE_CREATE_MUTATION = graphql(`
    mutation UserMediaProfileCreate($input: UserMediaProfileCreateInput!) {
      userMediaProfileCreate(input: $input) {
        id
        userId
        countryInterests
      }
    }
  `)

  const USER_MEDIA_PROFILE_UPDATE_MUTATION = graphql(`
    mutation UserMediaProfileUpdate($input: UserMediaProfileCreateInput!) {
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
      expect(result).toHaveProperty(
        'data.userMediaProfile.countryInterests',
        ['US', 'GB']
      )
    })

    it('returns null when profile does not exist', async () => {
      prismaMock.userMediaProfile.findUnique.mockResolvedValue(null)

      const result = await authClient({
        document: USER_MEDIA_PROFILE_QUERY
      })

      expect(result).toHaveProperty('data.userMediaProfile', null)
    })

    it('returns error when not authenticated', async () => {
      const result = await publicClient({
        document: USER_MEDIA_PROFILE_QUERY
      })

      expect((result as { data?: { userMediaProfile?: null } }).data?.userMediaProfile).toBeNull()
      expect(result).toHaveProperty('errors')
      expect(Array.isArray((result as { errors?: unknown[] }).errors)).toBe(true)
      expect((result as { errors?: { message?: string }[] }).errors?.[0]).toMatchObject({
        message: expect.stringContaining('Not authorized')
      })
    })
  })

  describe('userMediaProfileCreate mutation', () => {
    it('upserts profile with provided input', async () => {
      const createdProfile: PrismaUserMediaProfile = {
        id: 'new-profile-id',
        userId: 'testUserId',
        languageInterestIds: ['529'],
        countryInterestIds: ['US'],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.userMediaProfile.upsert.mockResolvedValue(createdProfile)

      const result = await authClient({
        document: USER_MEDIA_PROFILE_CREATE_MUTATION,
        variables: {
          input: {
            languageInterestIds: ['529'],
            countryInterestIds: ['US'],
            userInterestIds: ['video-id-1']
          }
        } as never
      })

      expect(prismaMock.userMediaProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' },
          create: {
            userId: 'testUserId',
            languageInterestIds: ['529'],
            countryInterestIds: ['US'],
            userInterests: { connect: [{ id: 'video-id-1' }] }
          },
          update: {
            userId: 'testUserId',
            languageInterestIds: ['529'],
            countryInterestIds: ['US'],
            userInterests: { connect: [{ id: 'video-id-1' }] }
          }
        })
      )
      expect(result).toHaveProperty(
        'data.userMediaProfileCreate.id',
        'new-profile-id'
      )
      expect(result).toHaveProperty(
        'data.userMediaProfileCreate.countryInterests',
        ['US']
      )
    })

    it('upserts profile with empty input defaults', async () => {
      const createdProfile: PrismaUserMediaProfile = {
        id: 'new-profile-id',
        userId: 'testUserId',
        languageInterestIds: [],
        countryInterestIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.userMediaProfile.upsert.mockResolvedValue(createdProfile)

      await authClient({
        document: USER_MEDIA_PROFILE_CREATE_MUTATION,
        variables: { input: {} } as never
      })

      expect(prismaMock.userMediaProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' },
          create: {
            userId: 'testUserId',
            languageInterestIds: [],
            countryInterestIds: [],
            userInterests: { connect: [] }
          },
          update: {
            userId: 'testUserId',
            languageInterestIds: [],
            countryInterestIds: [],
            userInterests: { connect: [] }
          }
        })
      )
    })

    it('returns error when not authenticated', async () => {
      const result = await publicClient({
        document: USER_MEDIA_PROFILE_CREATE_MUTATION,
        variables: { input: {} } as never
      })

      expect((result as { data?: unknown }).data).toBeNull()
      expect(result).toHaveProperty('errors')
      expect((result as { errors?: { message?: string }[] }).errors?.[0].message).toContain(
        'Not authorized'
      )
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

      prismaMock.userMediaProfile.update.mockResolvedValue(updatedProfile)

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

      expect(prismaMock.userMediaProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' },
          data: {
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

    it('updates only provided fields', async () => {
      const updatedProfile: PrismaUserMediaProfile = {
        id: 'profile-id',
        userId: 'testUserId',
        languageInterestIds: ['529'],
        countryInterestIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      prismaMock.userMediaProfile.update.mockResolvedValue(updatedProfile)

      await authClient({
        document: USER_MEDIA_PROFILE_UPDATE_MUTATION,
        variables: {
          input: { languageInterestIds: ['529'] }
        } as never
      })

      expect(prismaMock.userMediaProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'testUserId' },
          data: { languageInterestIds: ['529'] }
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
      expect((result as { errors?: { message?: string }[] }).errors?.[0].message).toContain(
        'Not authorized'
      )
    })
  })
})
