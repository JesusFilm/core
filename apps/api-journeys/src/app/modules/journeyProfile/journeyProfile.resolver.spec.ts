import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileResolver } from './journeyProfile.resolver'
import { JourneyProfileService } from './journeyProfile.service'

describe('JourneyProfileResolver', () => {
  let resolver: JourneyProfileResolver, prisma: PrismaService

  const profile = {
    id: '1',
    userId: 'userId',
    acceptedTermsAt: null
  }

  const journeyProfileService = {
    provide: JourneyProfileService,
    useFactory: () => ({
      getJourneyProfileByUserId: jest.fn((userId) =>
        userId === profile.userId ? profile : null
      ),
      save: jest.fn((input) => {
        return { ...profile, ...input }
      })
    })
  }

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyProfileResolver, journeyProfileService, PrismaService]
    }).compile()
    resolver = module.get<JourneyProfileResolver>(JourneyProfileResolver)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('getJourneyProfile', () => {
    it('should return user profile', async () => {
      expect(await resolver.getJourneyProfile('userId')).toEqual(profile)
    })
  })

  describe('journeyProfileCreate', () => {
    it('should create user profile', async () => {
      prisma.journeyProfile.create = jest
        .fn()
        .mockImplementationOnce((result) => result.data)
      await resolver.journeyProfileCreate('newUserId')
      expect(prisma.journeyProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'newUserId',
          acceptedTermsAt: new Date('2021-02-18T00:00:00.000Z')
        }
      })
    })

    it('should return existing profile', async () => {
      expect(await resolver.journeyProfileCreate('userId')).toEqual(profile)
    })
  })
})
