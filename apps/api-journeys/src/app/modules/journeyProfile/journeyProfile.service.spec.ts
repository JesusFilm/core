import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { PrismaService } from '../../lib/prisma.service'
import { JourneyProfileService } from './journeyProfile.service'

describe('journeyProfileService', () => {
  let service: JourneyProfileService, prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyProfileService, PrismaService]
    }).compile()

    service = module.get<JourneyProfileService>(JourneyProfileService)
    prisma = module.get<PrismaService>(PrismaService)
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const user = {
    _key: '1',
    userId: 'userId',
    acceptedTermsAt: '2021-11-19T12:34:56.647Z'
  }

  const userWithId = keyAsId(user)

  describe('getJourneyProfileByUserId', () => {
    it('should return a user role if exists', async () => {
      prisma.journeyProfile.findUnique = jest.fn().mockResolvedValue(user)
      expect(await service.getJourneyProfileByUserId('1')).toEqual(userWithId)
    })

    it('should return null if user role does not exist', async () => {
      prisma.journeyProfile.findUnique = jest.fn().mockResolvedValue(null)
      expect(await service.getJourneyProfileByUserId('2')).toEqual(null)
    })
  })
})
