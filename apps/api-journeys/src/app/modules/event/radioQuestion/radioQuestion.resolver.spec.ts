import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { RadioQuestionSubmissionEventCreateInput } from '../../../__generated__/graphql'
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
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
    journeyId: 'journey.id'
  }

  const input: RadioQuestionSubmissionEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    radioOptionBlockId: 'radioOptionBlock.id',
    stepId: 'step.id',
    label: 'stepName',
    value: 'radioOption.label'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RadioQuestionSubmissionEventResolver, eventService]
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
        ...input,
        __typename: 'RadioQuestionSubmissionEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })
  })
})
