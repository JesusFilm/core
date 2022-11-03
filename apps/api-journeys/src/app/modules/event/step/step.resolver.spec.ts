import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { StepViewEventCreateInput } from '../../../__generated__/graphql'
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

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
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
      const input: StepViewEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        value: 'stepName'
      }

      expect(await resolver.stepViewEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'StepViewEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id',
        stepId: input.blockId
      })
    })
  })
})
