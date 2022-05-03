import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { RadioQuestionResponseResolver } from './radioQuestion.resolver' // change

describe('RadioQuestionResponseResolver', () => {
  let resolver: RadioQuestionResponseResolver

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
      providers: [RadioQuestionResponseResolver, eventService]
    }).compile()
    resolver = module.get<RadioQuestionResponseResolver>(
      RadioQuestionResponseResolver
    )
  })

  describe('radioQuestionResponseCreate', () => {
    it('returns RadioQuestionResponse', async () => {
      expect(await resolver.radioQuestionResponseCreate(event)).toEqual(event)
    })
  })
})
