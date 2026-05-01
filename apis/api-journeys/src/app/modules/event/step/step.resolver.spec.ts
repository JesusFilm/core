import { Test, TestingModule } from '@nestjs/testing'

import {
  StepNextEventCreateInput,
  StepPreviousEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

import {
  StepNextEventResolver,
  StepPreviousEventResolver
} from './step.resolver'

describe('Step', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const response = {
    visitor: {
      id: 'visitor.id',
      createdAt: new Date(new Date('2021-02-18').setMinutes(-5))
    },
    journeyVisitor: {
      visitorId: 'visitor.id',
      journeyId: 'journey.id',
      createdAt: new Date(new Date('2021-02-18').setMinutes(-5))
    },
    journeyId: 'journey.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  describe('StepNextEventResolver', () => {
    let resolver: StepNextEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepNextEventResolver, eventService]
      }).compile()
      resolver = module.get<StepNextEventResolver>(StepNextEventResolver)
    })

    describe('stepNextEventCreate', () => {
      const input: StepNextEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        nextStepId: 'step.id',
        label: 'step name',
        value: 'next step name'
      }

      it('should return step next event', async () => {
        expect(await resolver.stepNextEventCreate('userId', input)).toEqual({
          ...input,
          typename: 'StepNextEvent',
          visitor: {
            connect: { id: 'visitor.id' }
          },
          createdAt: new Date().toISOString(),
          journey: { connect: { id: 'journey.id' } }
        })
      })
    })
  })

  describe('StepPreviousEventResolver', () => {
    let resolver: StepPreviousEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepPreviousEventResolver, eventService]
      }).compile()
      resolver = module.get<StepPreviousEventResolver>(
        StepPreviousEventResolver
      )
    })

    describe('stepPreviousEventCreate', () => {
      const input: StepPreviousEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        previousStepId: 'step.id',
        label: 'step name',
        value: 'Prev step name'
      }

      it('should return step Prev event', async () => {
        expect(await resolver.stepPreviousEventCreate('userId', input)).toEqual(
          {
            ...input,
            typename: 'StepPreviousEvent',
            visitor: {
              connect: { id: 'visitor.id' }
            },
            createdAt: new Date().toISOString(),
            journey: { connect: { id: 'journey.id' } }
          }
        )
      })
    })
  })
})
