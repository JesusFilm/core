import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { RadioQuestionSubmissionEventResolver } from './radioQuestion.resolver'

describe('RadioQuestionSubmissionEventResolver', () => {
  let resolver: RadioQuestionSubmissionEventResolver

  const event = {
    id: '1',
    __typename: 'RadioQuestionSubmissionEvent',
    blockId: '2',
    userId: '3',
    radioOptionBlockId: '4'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn(() => event)
    })
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
      expect(await resolver.radioQuestionSubmissionEventCreate(event)).toEqual(
        event
      )
    })
  })
})
