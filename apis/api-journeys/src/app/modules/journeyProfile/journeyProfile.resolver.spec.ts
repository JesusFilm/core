import { BullModule, getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { Queue } from 'bullmq'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { User } from '@core/nest/common/firebaseClient'
import { JourneyProfile } from '@core/prisma/journeys/client'
import { ProfileCreateJob } from '@core/yoga/profileCreate/types'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyProfileResolver } from './journeyProfile.resolver'

describe('JourneyProfileResolver', () => {
  let resolver: JourneyProfileResolver,
    prismaService: DeepMockProxy<PrismaService>,
    profileCreateQueue: DeepMockProxy<Queue<ProfileCreateJob>>

  const profile: JourneyProfile = {
    id: '1',
    userId: 'userId',
    acceptedTermsAt: new Date(),
    lastActiveTeamId: null,
    journeyFlowBackButtonClicked: null,
    plausibleJourneyFlowViewed: null,
    plausibleDashboardViewed: null
  }

  const user: User = {
    id: 'newUserId',
    email: 'my-nama-yeff@example.com',
    firstName: 'My-Nama',
    lastName: 'Yeff',
    emailVerified: true
  }

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-02-18'))
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CaslAuthModule.register(AppCaslFactory),
        BullModule.registerQueue({ name: 'api-journeys-profile-create' })
      ],
      providers: [
        JourneyProfileResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    })
      .overrideProvider(getQueueToken('api-journeys-profile-create'))
      .useValue(mockDeep<Queue<ProfileCreateJob>>())
      .compile()
    resolver = module.get<JourneyProfileResolver>(JourneyProfileResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    profileCreateQueue = module.get<Queue<ProfileCreateJob>>(
      getQueueToken('api-journeys-profile-create')
    ) as DeepMockProxy<Queue<ProfileCreateJob>>
  })

  describe('getJourneyProfile', () => {
    it('should return user profile', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      expect(await resolver.getJourneyProfile('userId')).toEqual(profile)
    })
  })

  describe('journeyProfileCreate', () => {
    it('should create user profile and add to queue', async () => {
      const createdProfile = {
        id: 'journeyProfileId',
        userId: 'newUserId',
        acceptedTermsAt: new Date(),
        lastActiveTeamId: null,
        journeyFlowBackButtonClicked: null,
        plausibleJourneyFlowViewed: null,
        plausibleDashboardViewed: null
      }

      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(null)
      prismaService.journeyProfile.create.mockResolvedValueOnce(createdProfile)

      await resolver.journeyProfileCreate({
        id: 'newUserId',
        email: 'my-nama-yeff@example.com',
        firstName: 'My-Nama',
        lastName: 'Yeff',
        emailVerified: true
      })

      expect(prismaService.journeyProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'newUserId',
          acceptedTermsAt: new Date('2021-02-18T00:00:00.000Z')
        }
      })

      expect(profileCreateQueue.add).toHaveBeenCalledWith(
        'profile-create',
        {
          createdProfile,
          user
        },
        {
          jobId: 'newUserId',
          removeOnComplete: {
            age: 24 * 3600
          },
          removeOnFail: {
            age: 24 * 3600
          }
        }
      )
    })

    it('should return existing profile without adding to queue', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      expect(await resolver.journeyProfileCreate(user)).toEqual(profile)
      expect(profileCreateQueue.add).not.toHaveBeenCalled()
    })
  })

  describe('journeyProfileUpdate', () => {
    it('should update journeyProfile lastTeamId', async () => {
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

    it('should update journeyProfile journeyFlowBackButtonClicked', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      await resolver.journeyProfileUpdate('userId', {
        journeyFlowBackButtonClicked: true
      })
      expect(prismaService.journeyProfile.update).toHaveBeenCalledWith({
        where: { id: profile.id },
        data: {
          journeyFlowBackButtonClicked: true
        }
      })
    })

    it('should update journeyProfile plausibleJourneyFlowViewed', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      await resolver.journeyProfileUpdate('userId', {
        plausibleJourneyFlowViewed: true
      })
      expect(prismaService.journeyProfile.update).toHaveBeenCalledWith({
        where: { id: profile.id },
        data: {
          plausibleJourneyFlowViewed: true
        }
      })
    })

    it('should update journeyProfile plausibleDashboardViewed', async () => {
      prismaService.journeyProfile.findUnique.mockResolvedValueOnce(profile)
      await resolver.journeyProfileUpdate('userId', {
        plausibleDashboardViewed: true
      })
      expect(prismaService.journeyProfile.update).toHaveBeenCalledWith({
        where: { id: profile.id },
        data: {
          plausibleDashboardViewed: true
        }
      })
    })
  })
})
