import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
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
      save: jest.fn((event) => event)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn((blockId) => {
        switch (blockId) {
          case block.id:
            return block
          case stepBlock.id:
            return stepBlock
          case errorStep.id:
            return errorStep
        }
      })
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getByUserIdAndJourneyId: jest.fn(() => visitorWithId)
    })
  }

  const input: StepViewEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    value: 'stepName'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    locked: false
  }

  const stepBlock = {
    ...block,
    id: 'step.id'
  }

  const errorStep = {
    ...block,
    id: 'anotherStep.id',
    journeyId: 'anotherJourney.id'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  describe('StepViewEventResolver', () => {
    let resolver: StepViewEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          StepViewEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<StepViewEventResolver>(StepViewEventResolver)
    })

    describe('stepViewEventCreate', () => {
      it('returns StepViewEvent', async () => {
        expect(await resolver.stepViewEventCreate('userId', input)).toEqual({
          ...input,
          __typename: 'StepViewEvent',
          visitorId: visitorWithId.id,
          createdAt: new Date().toISOString(),
          journeyId: block.journeyId,
          stepId: input.blockId
        })
      })
    })
  })

  describe('StepNextEventResolver', () => {
    let resolver: StepNextEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepNextEventResolver, eventService, blockService]
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
          nextStepId: errorStep.id
        }
        await expect(
          async () => await resolver.stepNextEventCreate('userId', errorInput)
        ).rejects.toThrow(
          `Next step ID ${errorInput.nextStepId} does not exist on Journey with ID ${stepBlock.journeyId}`
        )
      })
    })
  })
})
