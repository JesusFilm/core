import { Test, TestingModule } from '@nestjs/testing'
import { DbEvent, EventResolver } from './event.resolver'
import { EventService } from './event.service'
import { PrismaService } from '../../lib/prisma.service'

describe('EventResolver', () => {
  let resolver: EventResolver

  describe('__resolveType', () => {
    const event = {
      id: 'eventId'
    }

    const eventService = {
      provide: EventService,
      useFactory: () => ({
        getAllByVisitorId: jest.fn(() => [event])
      })
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [EventResolver, eventService, PrismaService]
      }).compile()
      resolver = module.get<EventResolver>(EventResolver)
    })

    it('returns __typename', () => {
      const event = {
        __typename: 'TextResponseSubmissionEvent'
      } as unknown as DbEvent

      expect(resolver.__resolveType(event)).toEqual(
        'TextResponseSubmissionEvent'
      )
    })
  })
})
