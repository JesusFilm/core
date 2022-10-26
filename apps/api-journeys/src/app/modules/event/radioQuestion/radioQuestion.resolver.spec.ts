import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import {
  RadioOptionBlock,
  RadioQuestionBlock,
  RadioQuestionSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { RadioQuestionSubmissionEventResolver } from './radioQuestion.resolver'

describe('RadioQuestionSubmissionEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: RadioQuestionSubmissionEventResolver

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      getStepHeader: jest.fn((parentBlockId) => {
        switch (parentBlockId) {
          case radioQuestionBlock.parentBlockId:
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
          case radioQuestionBlock.id:
            return radioQuestionBlock
          case radioOptionBlock.id:
            return radioOptionBlock
          case untitledStepNameBlock.id:
            return untitledStepNameBlock
        }
      })
    })
  }

  const input: RadioQuestionSubmissionEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    radioOptionBlockId: 'radioOptionBlock.id'
  }
  const untitledStepInput: RadioQuestionSubmissionEventCreateInput = {
    id: '2',
    blockId: 'untitledStepNameBlock.id',
    radioOptionBlockId: 'radioOptionBlock.id'
  }

  const radioQuestionBlock: RadioQuestionBlock = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id'
  }

  const untitledStepNameBlock: RadioQuestionBlock = {
    ...radioQuestionBlock,
    id: 'untitledStepNameBlock.id',
    parentBlockId: 'untitled'
  }

  const radioOptionBlock: RadioOptionBlock = {
    id: 'radioOptionBlock.id',
    label: 'option',
    journeyId: 'journey.id'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RadioQuestionSubmissionEventResolver,
        eventService,
        blockService
      ]
    }).compile()
    resolver = module.get<RadioQuestionSubmissionEventResolver>(
      RadioQuestionSubmissionEventResolver
    )
  })

  describe('radioQuestionSubmissionEventCreate', () => {
    it('returns RadioQuestionSubmissionEvent', async () => {
      expect(
        await resolver.radioQuestionSubmissionEventCreate('userId', input)
      ).toEqual({
        id: input.id,
        blockId: input.blockId,
        __typename: 'RadioQuestionSubmissionEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: radioQuestionBlock.journeyId,
        stepId: 'step.id', // TODO
        label: 'header',
        value: radioOptionBlock.label
      })
    })

    it('shoudl return event with untitled label', async () => {
      expect(
        await resolver.radioQuestionSubmissionEventCreate(
          'userId',
          untitledStepInput
        )
      ).toEqual({
        id: untitledStepInput.id,
        blockId: untitledStepInput.blockId,
        __typename: 'RadioQuestionSubmissionEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: untitledStepNameBlock.journeyId,
        stepId: 'step.id', // TODO
        label: 'Untitled',
        value: radioOptionBlock.label
      })
    })
  })
})
