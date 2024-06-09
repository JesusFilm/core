import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { EventEmailNotifications } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { EventEmailNotificationsResolver } from './eventEmailNotifications.resolver'

describe('EventEmailNotifications', () => {
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
  const input = { journeyId: 'journeyId', userId: 'userId1', value: true }

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
      expect(
        prismaService.eventEmailNotifications.findMany
      ).toHaveBeenCalledWith({ where: { journeyId: 'journeyId' } })
    })
  })

  describe('eventEmailNotificationsUpdate', () => {
    it('should upsert an event email notification by id', async () => {
      prismaService.eventEmailNotifications.upsert.mockResolvedValueOnce({
        ...eventEmailNotification,
        value: true
      })
      expect(await resolver.eventEmailNotificationsUpdate(input, '1')).toEqual({
        id: '1',
        journeyId: 'journeyId',
        userId: 'userId1',
        value: true
      })
      expect(prismaService.eventEmailNotifications.upsert).toHaveBeenCalledWith(
        {
          where: { id: '1' },
          create: input,
          update: input
        }
      )
    })

    it('should upsert an event email notification by userId and journeyId', async () => {
      prismaService.eventEmailNotifications.upsert.mockResolvedValueOnce({
        ...eventEmailNotification,
        value: true
      })
      expect(await resolver.eventEmailNotificationsUpdate(input)).toEqual({
        id: '1',
        journeyId: 'journeyId',
        userId: 'userId1',
        value: true
      })
      expect(prismaService.eventEmailNotifications.upsert).toHaveBeenCalledWith(
        {
          where: {
            userId_journeyId: { userId: 'userId1', journeyId: 'journeyId' }
          },
          create: input,
          update: input
        }
      )
    })
  })

  describe('eventEmailNotificationsDelete', () => {
    it('should delete an event email notification by id', async () => {
      prismaService.eventEmailNotifications.delete.mockResolvedValueOnce(
        eventEmailNotification
      )
      expect(await resolver.eventEmailNotificationsDelete(input, '1')).toEqual(
        eventEmailNotification
      )
      expect(prismaService.eventEmailNotifications.delete).toHaveBeenCalledWith(
        {
          where: {
            id: '1'
          }
        }
      )
    })

    it('should delete an event email notification by userId and journeyId', async () => {
      prismaService.eventEmailNotifications.delete.mockResolvedValueOnce(
        eventEmailNotification
      )
      expect(await resolver.eventEmailNotificationsDelete(input)).toEqual(
        eventEmailNotification
      )
      expect(prismaService.eventEmailNotifications.delete).toHaveBeenCalledWith(
        {
          where: {
            userId_journeyId: { userId: 'userId1', journeyId: 'journeyId' }
          }
        }
      )
    })
  })
})
