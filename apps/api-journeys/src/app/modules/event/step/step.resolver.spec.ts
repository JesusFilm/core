import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import {
  StepNextEventCreateInput,
  StepViewEventCreateInput
} from '../../../__generated__/graphql'
import { VisitorService } from '../../visitor/visitor.service'
import { StepNextEventResolver, StepViewEventResolver } from './step.resolver'

describe('Step', () => {
  let vService: VisitorService
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })
  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      update: jest.fn(() => null)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
    journeyId: 'journey.id'
  }

  describe('stepViewEventCreate', () => {
    let resolver: StepViewEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepViewEventResolver, eventService, visitorService]
      }).compile()
      resolver = module.get<StepViewEventResolver>(StepViewEventResolver)
      vService = module.get<VisitorService>(VisitorService)
    })

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
        journeyId: 'journey.id',
        stepId: input.blockId
      })
    })

    it('should update visitor last event at', async () => {
      const input: StepViewEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        value: 'stepName'
      }
      await resolver.stepViewEventCreate('userId', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastStepViewedAt: new Date().toISOString()
      })
    })
  })

  describe('StepNextEventResolver', () => {
    let resolver: StepNextEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepNextEventResolver, eventService, visitorService]
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
          __typename: 'StepNextEvent',
          visitorId: 'visitor.id',
          journeyId: 'journey.id'
        })
      })
    })
  })
})
