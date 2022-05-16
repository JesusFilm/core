import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { StepViewEventResolver } from './step.resolver'

describe('StepViewEventResolver', () => {
  let resolver: StepViewEventResolver

  const input = {
    id: '1',
    blockId: 'block.id',
    previousBlockId: 'previousBlock.id',
    journeyId: 'journey.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StepViewEventResolver, eventService]
    }).compile()
    resolver = module.get<StepViewEventResolver>(StepViewEventResolver)
  })

  describe('stepViewEventCreate', () => {
    it('returns StepViewEvent', async () => {
      expect(await resolver.stepViewEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'StepViewEvent',
        userId: 'userId'
      })
    })
  })
})
