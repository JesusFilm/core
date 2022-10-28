import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import { TextResponseSubmissionEventCreateInput } from '../../../__generated__/graphql'
import { TextResponseSubmissionEventResolver } from './textResponse.resolver'

describe('TextResponseEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: TextResponseSubmissionEventResolver

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
      getVisitorByUserIdAndJourneyId: jest.fn(() => visitorWithId),
      getParentStepBlockByBlockId: jest.fn(() => stepBlock)
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

  const input: TextResponseSubmissionEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    value: 'My response'
  }

  const untitledStepInput: TextResponseSubmissionEventCreateInput = {
    id: '2',
    blockId: 'untitledStepNameBlock.id',
    value: 'My response'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    label: 'textResponse.label'
  }

  const untitledStepNameBlock = {
    ...block,
    id: 'untitledStepNameBlock.id',
    parentBlockId: 'untitled'
  }

  const stepBlock = {
    __typename: 'StepBlock',
    id: 'stepBlock.id',
    parentBlockId: null,
    journeyId: 'journey.id',
    locked: false
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextResponseSubmissionEventResolver,
        eventService,
        blockService
      ]
    }).compile()
    resolver = module.get<TextResponseSubmissionEventResolver>(
      TextResponseSubmissionEventResolver
    )
  })

  describe('textResponseSubmissionEventCreate', () => {
    it('returns TextResponseSubmissionEvent', async () => {
      expect(
        await resolver.textResponseSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        __typename: 'TextResponseSubmissionEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: 'header'
      })
    })

    it('should return event with untitled label', async () => {
      expect(
        await resolver.textResponseSubmissionEventCreate(
          'userId',
          untitledStepInput
        )
      ).toEqual({
        ...untitledStepInput,
        __typename: 'TextResponseSubmissionEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: untitledStepNameBlock.journeyId,
        stepId: stepBlock.id,
        label: 'Untitled'
      })
    })
  })
})
