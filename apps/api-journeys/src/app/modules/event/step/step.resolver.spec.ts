import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { StepViewEventResolver } from './step.resolver'

describe('StepViewEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

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
      save: jest.fn((input) => input),
      getBlockById: jest.fn(() => block)
    })
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id'
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
        userId: 'userId',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })
  })
})
