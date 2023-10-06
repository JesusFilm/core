import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { JourneyProfile } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyProfileResolver } from './journeyProfile.resolver'

describe('JourneyProfileResolver', () => {
  let resolver: JourneyProfileResolver,
    prismaService: DeepMockProxy<PrismaService>

  const profile: JourneyProfile = {
    id: '1',
    userId: 'userId',
    acceptedTermsAt: new Date(),
    lastActiveTeamId: null,
    onboardingFormCompletedAt: null
  }

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-02-18'))
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyProfileResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<JourneyProfileResolver>(JourneyProfileResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('getJourneyProfile', () => {
    it('should return user profile', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      expect(await resolver.getJourneyProfile('userId')).toEqual(profile)
    })
  })

  describe('journeyProfileCreate', () => {
    it('should create user profile', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(null)
      await resolver.journeyProfileCreate('newUserId')
      expect(prismaService.journeyProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'newUserId',
          acceptedTermsAt: new Date('2021-02-18T00:00:00.000Z')
        }
      })
    })

    it('should return existing profile', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      expect(await resolver.journeyProfileCreate('userId')).toEqual(profile)
    })
  })

  describe('journeyProfileUpdate', () => {
    it('should update journeyProfile', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      await resolver.journeyProfileUpdate('userId', {
        lastActiveTeamId: 'lastTeamId'
      })
      expect(prismaService.journeyProfile.update).toHaveBeenCalledWith({
        where: { id: profile.id },
        data: {
          lastActiveTeamId: 'lastTeamId'
        }
      })
    })
  })

  describe('journeyProfileOnboardingFormComplete', () => {
    it('should update onboardingFormCompletedAt', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      await resolver.journeyProfileOnboardingFormComplete('userId')
      expect(prismaService.journeyProfile.update).toHaveBeenCalledWith({
        where: { id: profile.id },
        data: {
          onboardingFormCompletedAt: new Date('2021-02-18T00:00:00.000Z')
        }
      })
    })
  })
})
