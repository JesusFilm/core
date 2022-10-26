import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import {
  StepBlock,
  StepViewEventCreateInput
} from '../../../__generated__/graphql'
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
      save: jest.fn((input) => input),
      getStepHeader: jest.fn((parentBlockId) => {
        switch (parentBlockId) {
          case block.parentBlockId:
            return 'header'
          case untitledStepNameBlock.parentBlockId:
            return 'Untitled'
        }
      }),
      getVisitorByUserIdAndTeamId: jest.fn(() => visitorWithId)
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

  const block: StepBlock = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    locked: false
  }

  const untitledStepNameBlock: StepBlock = {
    ...block,
    id: 'untitledStepNameBlock.id',
    parentBlockId: 'untitled',
    locked: false
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

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
        stepId: input.blockId, // TODO
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
        stepId: untitledStepInput.blockId, // TODO
        label: null,
        value: 'Untitled'
      })
    })
  })
})
