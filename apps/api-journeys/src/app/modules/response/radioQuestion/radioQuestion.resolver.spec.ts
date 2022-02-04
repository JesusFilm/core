import { Test, TestingModule } from '@nestjs/testing'
import { ResponseService } from '../response.service'
import { RadioQuestionResponseResolver } from './radioQuestion.resolver'

describe('RadioQuestionResponseResolver', () => {
  let resolver: RadioQuestionResponseResolver

  const response = {
    _key: '1',
    __typename: 'RadioQuestionResponse',
    blockId: '2',
    userId: '3',
    radioOptionBlockId: '4'
  }

  const responseresponse = {
    id: '1',
    __typename: 'RadioQuestionResponse',
    blockId: '2',
    userId: '3',
    radioOptionBlockId: '4'
  }

  const responseService = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RadioQuestionResponseResolver, responseService]
    }).compile()
    resolver = module.get<RadioQuestionResponseResolver>(
      RadioQuestionResponseResolver
    )
  })

  describe('radioQuestionResponseCreate', () => {
    it('returns RadioQuestionResponse', async () => {
      expect(await resolver.radioQuestionResponseCreate(response)).toEqual(
        responseresponse
      )
    })
  })
})
