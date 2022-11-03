import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import {
  StepNextEventCreateInput,
  StepViewEventCreateInput
} from '../../../__generated__/graphql'
import { VisitorService } from '../../visitor/visitor.service'
import { StepNextEventResolver, StepViewEventResolver } from './step.resolver'

describe('Step', () => {
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

  describe('StepNextEventResolver', () => {
    let resolver: StepNextEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StepNextEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<StepNextEventResolver>(StepNextEventResolver)
    })

    describe('stepNextEventCreate', () => {
      const stepNextInput: StepNextEventCreateInput = {
        ...input,
        nextStepId: 'step.id',
        label: 'step name',
        value: 'next step name'
      }

      it('should return step next event', async () => {
        expect(
          await resolver.stepNextEventCreate('userId', stepNextInput)
        ).toEqual({
          ...stepNextInput,
          __typename: 'StepNextEvent',
          visitorId: visitorWithId.id,
          createdAt: new Date().toISOString(),
          journeyId: block.journeyId
        })
      })

      it('should throw error when next step id does not belong to the same journey as block id', async () => {
        const errorInput = {
          ...stepNextInput,
          nextStepId: 'anotherStep.id'
        }
        await expect(
          async () => await resolver.stepNextEventCreate('userId', errorInput)
        ).rejects.toThrow(
          `Next step ID ${
            errorInput.nextStepId as string
          } does not exist on Journey with ID ${block.journeyId}`
        )
      })
    })
  })
})
