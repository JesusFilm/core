import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { StepResponseResolver } from './step.resolver' // change

describe('StepEventResolver', () => {
  let resolver: StepResponseResolver

  const event = {
    id: '1',
    __typename: 'StepEvent',
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
      providers: [StepResponseResolver, eventService]
    }).compile()
    resolver = module.get<StepResponseResolver>(StepResponseResolver)
  })

  describe('StepEvent', () => {
    it('returns StepEvent', async () => {
      expect(await resolver.stepResponseCreate('userId', event)).toEqual({
        ...event,
        userId: 'userId'
      })
    })
  })
})
