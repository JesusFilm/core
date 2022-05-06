import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { JourneyViewEventResolver } from './journey.resolver'

describe('JourneyViewEventResolver', () => {
  let resolver: JourneyViewEventResolver

  const event = {
    id: '1',
    __typename: 'JourneyViewEvent',
    blockId: 'block.id',
    previousBlockId: 'previousBlock.id',
    journeyId: 'journey.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyViewEventResolver, eventService]
    }).compile()
    resolver = module.get<JourneyViewEventResolver>(JourneyViewEventResolver)
  })

  describe('JourneyViewEventCreate', () => {
    it('returns journeyViewEvent', async () => {
      expect(await resolver.journeyViewEventCreate('userId', event)).toEqual({
        ...event,
        userId: 'userId'
      })
    })
  })
})
