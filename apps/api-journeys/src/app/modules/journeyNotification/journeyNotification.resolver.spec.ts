import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Journey, JourneyNotification } from '.prisma/api-journeys-client'

import { PrismaService } from '../../lib/prisma.service'

import { JourneyNotificationResolver } from './journeyNotification.resolver'

describe('JourneyNotificationResolver', () => {
  let resolver: JourneyNotificationResolver,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyNotificationResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<JourneyNotificationResolver>(
      JourneyNotificationResolver
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const journeyNotification: JourneyNotification = {
    id: '1',
    journeyId: 'journeyId',
    userId: 'userId',
    userJourneyId: 'userJourneyId',
    userTeamId: null,
    visitorInteractionEmail: false
  }
  const input = {
    journeyId: 'journeyId',
    visitorInteractionEmail: true
  }

  describe('eventEmailNotificationsUpdate', () => {
    it('should upsert an event email notification by userId and journeyId', async () => {
      prismaService.journeyNotification.upsert.mockResolvedValueOnce({
        ...journeyNotification,
        visitorInteractionEmail: true
      })
      prismaService.journey.findUnique.mockResolvedValue({
        id: 'journeyId',
        team: {
          id: 'teamId',
          userTeams: [
            {
              id: 'userJourneyId',
              userId: 'userId',
              teamId: 'teamId'
            }
          ]
        },
        userJourneys: [
          {
            id: 'userJourneyId',
            userId: 'userId',
            journeyId: 'journeyId',
            updatedAt: new Date(),
            role: 'owner',
            openedAt: null
          }
        ]
      } as unknown as Journey)
      expect(await resolver.journeyNotificationUpdate('userId', input)).toEqual(
        {
          id: '1',
          journeyId: 'journeyId',
          userId: 'userId',
          userJourneyId: 'userJourneyId',
          userTeamId: null,
          visitorInteractionEmail: true
        }
      )
      expect(prismaService.journeyNotification.upsert).toHaveBeenCalledWith({
        where: {
          userId_journeyId: {
            userId: 'userId',
            journeyId: 'journeyId'
          }
        },
        create: {
          userId: 'userId',
          userJourneyId: 'userJourneyId',
          userTeamId: 'userJourneyId',
          ...input
        },
        update: {
          userJourneyId: 'userJourneyId',
          userTeamId: 'userJourneyId',
          ...input
        }
      })
    })
  })
})
