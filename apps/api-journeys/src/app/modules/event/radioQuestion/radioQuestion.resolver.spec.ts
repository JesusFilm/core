import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { RadioQuestionEventResolver } from './radioQuestion.resolver'

describe('RadioQuestionEventResolver', () => {
  let resolver: RadioQuestionEventResolver

  const event = {
    id: '1',
    __typename: 'RadioQuestionEvent',
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
      providers: [RadioQuestionEventResolver, eventService]
    }).compile()
    resolver = module.get<RadioQuestionEventResolver>(
      RadioQuestionEventResolver
    )
  })

  describe('radioQuestionEventCreate', () => {
    it('returns RadioQuestionResponse', async () => {
      expect(await resolver.radioQuestionEventCreate(event)).toEqual(event)
    })
  })
})
