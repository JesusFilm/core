import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { StepEventResolver } from './step.resolver'

describe('StepEventResolver', () => {
  let resolver: StepEventResolver

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
      providers: [StepEventResolver, eventService]
    }).compile()
    resolver = module.get<StepEventResolver>(StepEventResolver)
  })

  describe('StepEvent', () => {
    it('returns StepEvent', async () => {
      expect(await resolver.stepEventCreate('userId', event)).toEqual({
        ...event,
        userId: 'userId'
      })
    })
  })
})
