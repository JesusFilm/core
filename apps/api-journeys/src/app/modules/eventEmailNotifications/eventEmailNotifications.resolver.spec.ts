import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { EventEmailNotifications } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { EventEmailNotificationsResolver } from './eventEmailNotifications.resolver'

describe('EventEmailNotificationsResolver', () => {
  let resolver: EventEmailNotificationsResolver,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmailNotificationsResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    resolver = module.get<EventEmailNotificationsResolver>(
      EventEmailNotificationsResolver
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const eventEmailNotification: EventEmailNotifications = {
    id: '1',
    journeyId: 'journeyId',
    userId: 'userId1',
    value: false
  }

  describe('eventEmailNotificationsByJourney', () => {
    it('should return an array of event email notifications', async () => {
      const eventEmailNotifications: EventEmailNotifications[] = [
        eventEmailNotification,
        { ...eventEmailNotification, id: '2' }
      ]

      prismaService.eventEmailNotifications.findMany.mockResolvedValueOnce(
        eventEmailNotifications
      )
      expect(
        await resolver.eventEmailNotificationsByJourney('journeyId')
      ).toEqual(eventEmailNotifications)
    })

    it('should throw an error if no event email notifications are found', async () => {
      prismaService.eventEmailNotifications.findMany.mockResolvedValueOnce([])
      await expect(
        resolver.eventEmailNotificationsByJourney('journeyId')
      ).rejects.toThrow('No event email notifications found')
    })
  })

  describe('eventEmailNotificationsUpsert', () => {
    const input = { journeyId: 'journeyId', userId: 'userId1', value: true }

    it('should upsert an event email notification', async () => {
      prismaService.eventEmailNotifications.upsert.mockResolvedValueOnce({
        ...eventEmailNotification,
        value: true
      })
      expect(await resolver.eventEmailNotificationsUpsert('1', input)).toEqual({
        id: '1',
        journeyId: 'journeyId',
        userId: 'userId1',
        value: true
      })
    })

    it('should throw an error if no event email notifications are found', async () => {
      await expect(
        resolver.eventEmailNotificationsUpsert('1', input)
      ).rejects.toThrow('No event email notifications found')
    })
  })

  describe('eventEmailNotificationsDelete', () => {
    it('should delete an event email notification', async () => {
      prismaService.eventEmailNotifications.delete.mockResolvedValueOnce(
        eventEmailNotification
      )
      expect(await resolver.eventEmailNotificationsDelete('1')).toEqual(
        eventEmailNotification
      )
    })

    it('should throw an error if no event email notifications are found', async () => {
      await expect(resolver.eventEmailNotificationsDelete('1')).rejects.toThrow(
        'Event email notifications not found'
      )
    })
  })
})
