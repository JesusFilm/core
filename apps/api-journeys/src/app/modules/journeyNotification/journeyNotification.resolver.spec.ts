import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { JourneyNotification } from '.prisma/api-journeys-client'

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

  const eventEmailNotification: JourneyNotification = {
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

  const eventEmailNotifications: JourneyNotification[] = [
    eventEmailNotification,
    { ...eventEmailNotification, id: '2' }
  ]

  describe('eventEmailNotificationsByJourney', () => {
    it('should return an array of event email notifications', async () => {
      prismaService.journeyNotification.findMany.mockResolvedValueOnce(
        eventEmailNotifications
      )

      expect(await resolver.journeyNotifications('journeyId')).toEqual(
        eventEmailNotifications
      )
      expect(prismaService.journeyNotification.findMany).toHaveBeenCalledWith({
        where: { journeyId: 'journeyId' }
      })
    })
  })

  describe('eventEmailNotificationsUpdate', () => {
    it('should upsert an event email notification by userId and journeyId', async () => {
      prismaService.journeyNotification.upsert.mockResolvedValueOnce({
        ...eventEmailNotification,
        visitorInteractionEmail: true
      })
      expect(
        await resolver.journeyNotificationsUpdate('userId', input)
      ).toEqual({
        id: '1',
        journeyId: 'journeyId',
        userId: 'userId',
        userJourneyId: 'userJourneyId',
        userTeamId: null,
        visitorInteractionEmail: true
      })
      expect(prismaService.journeyNotification.upsert).toHaveBeenCalledWith({
        where: {
          userId_journeyId: { userId: 'userId', journeyId: 'journeyId' }
        },
        create: { userId: 'userId', ...input },
        update: input
      })
    })
  })
})
