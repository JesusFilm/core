import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { StepViewEventResolver } from './step.resolver'

describe('StepViewEventResolver', () => {
  let resolver: StepViewEventResolver

  const event = {
    id: '1',
    __typename: 'StepViewEvent',
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
      providers: [StepViewEventResolver, eventService]
    }).compile()
    resolver = module.get<StepViewEventResolver>(StepViewEventResolver)
  })

  describe('StepViewEvent', () => {
    it('returns StepViewEvent', async () => {
      expect(await resolver.stepViewEventCreate('userId', event)).toEqual({
        ...event,
        userId: 'userId'
      })
    })
  })
})
