import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { RadioQuestionSubmissionEventResolver } from './radioQuestion.resolver'

describe('RadioQuestionSubmissionEventResolver', () => {
  let resolver: RadioQuestionSubmissionEventResolver

  const input = {
    id: '1',
    blockId: '2',
    radioOptionBlockId: '4'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input)
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
      expect(
        await resolver.radioQuestionSubmissionEventCreate('userId', input)
<<<<<<< HEAD
      ).toEqual({
        ...input,
        __typename: 'RadioQuestionSubmissionEvent',
        userId: 'userId'
      })
=======
      ).toEqual({ ...input, userId: 'userId' })
>>>>>>> b3b3c7f5 (chore: fix naming)
    })
  })
})
