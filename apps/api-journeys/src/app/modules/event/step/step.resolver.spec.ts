import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import {
  StepNextEventCreateInput,
  StepViewEventCreateInput
} from '../../../__generated__/graphql'
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
      save: jest.fn((input) => input),
      getStepHeader: jest.fn((blockId) => {
        switch (blockId) {
          case block.parentBlockId:
            return 'header'
          case untitledStepNameBlock.parentBlockId:
            return 'Untitled'
          case stepNextBlock.parentBlockId:
            return 'Current step header'
          case nextStepBlock.id:
            return 'Next step header'
        }
      }),
      getVisitorByUserIdAndJourneyId: jest.fn(() => visitorWithId)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn((blockId) => {
        switch (blockId) {
          case block.id:
            return block
          case untitledStepNameBlock.id:
            return untitledStepNameBlock
          case stepNextBlock.id:
            return stepNextBlock
        }
      })
    })
  }

  const input: StepViewEventCreateInput = {
    id: '1',
    blockId: 'block.id'
  }

  const untitledStepInput: StepViewEventCreateInput = {
    id: '2',
    blockId: 'untitledStepNameBlock.id'
  }

  const stepNextInput: StepNextEventCreateInput = {
    id: '3',
    blockId: 'stepNextBlock.id',
    nextStepId: 'nextStep.id'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    locked: false
  }

  const untitledStepNameBlock = {
    ...block,
    id: 'untitledStepNameBlock.id',
    parentBlockId: 'untitled',
    locked: false
  }

  const stepNextBlock = {
    ...block,
    id: 'stepNextBlock.id',
    parentBlockId: 'stepNextBlock.parentBlockId',
    locked: false
  }

  const nextStepBlock = {
    id: 'nextStep.id'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)
  describe('StepViewEventResolver', () => {
    let resolver: StepViewEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepViewEventResolver, eventService, blockService]
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
          stepId: input.blockId,
          label: null,
          value: 'header'
        })
      })

      it('should return event with untitled label', async () => {
        expect(
          await resolver.stepViewEventCreate('userId', untitledStepInput)
        ).toEqual({
          ...untitledStepInput,
          __typename: 'StepViewEvent',
          visitorId: visitorWithId.id,
          createdAt: new Date().toISOString(),
          journeyId: untitledStepNameBlock.journeyId,
          stepId: untitledStepInput.blockId,
          label: null,
          value: 'Untitled'
        })
      })
    })
  })

  describe('stepNextEvent', () => {
    let resolver: StepNextEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [StepNextEventResolver, eventService, blockService]
      }).compile()
      resolver = module.get<StepNextEventResolver>(StepNextEventResolver)
    })
    it('returns step next event', async () => {
      expect(
        await resolver.stepNextEventCreate('userId', stepNextInput)
      ).toEqual({
        ...stepNextInput,
        __typename: 'StepNextEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: stepNextBlock.journeyId,
        stepId: stepNextInput.blockId,
        label: 'Current step header',
        value: 'Next step header'
      })
    })
  })
})
