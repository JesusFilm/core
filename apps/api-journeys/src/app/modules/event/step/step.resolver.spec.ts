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
      getVisitorByUserIdAndJourneyId: jest.fn(() => visitorWithId)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }

  const input: StepViewEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    value: 'stepName'
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
        stepId: input.blockId
      })
    })
  })
})
