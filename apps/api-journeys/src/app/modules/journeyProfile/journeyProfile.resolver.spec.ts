import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileResolver } from './journeyProfile.resolver'

describe('JourneyProfileResolver', () => {
  let resolver: JourneyProfileResolver, prismaService: PrismaService

  const profile = {
    id: '1',
    userId: 'userId',
    acceptedTermsAt: null
  }

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyProfileResolver, PrismaService]
    }).compile()
    resolver = module.get<JourneyProfileResolver>(JourneyProfileResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.journeyProfile.findUnique = jest
      .fn()
      .mockResolvedValueOnce(profile)
    prismaService.journeyProfile.create = jest
      .fn()
      .mockImplementationOnce((result) => result.data)
  })

  describe('getJourneyProfile', () => {
    it('should return user profile', async () => {
      expect(await resolver.getJourneyProfile('userId')).toEqual(profile)
    })
  })

  describe('journeyProfileCreate', () => {
    it('should create user profile', async () => {
      prismaService.journeyProfile.findUnique = jest
        .fn()
        .mockResolvedValueOnce(null)
      await resolver.journeyProfileCreate('newUserId')
      expect(prismaService.journeyProfile.create).toHaveBeenCalledWith({
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
