import { Test, TestingModule } from '@nestjs/testing'
import { RadioQuestionResponseResolver } from './radioQuestion.resolvers'
import { ResponseService } from '../response.service'

describe('RadioQuestion', () => {
  let resolver: RadioQuestionResponseResolver

  const response = {
    _key: "1",
    type: 'RadioQuestionResponse',
    blockId: "2",
    userId: "3",
    radioOptionBlockId: "4"
  }

  const responseresponse = {
    id: "1",
    type: 'RadioQuestionResponse',
    blockId: "2",
    userId: "3",
    radioOptionBlockId: "4"
  }

  const responseservice = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response),      
    })
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RadioQuestionResponseResolver, responseservice]
    }).compile()
    resolver = module.get<RadioQuestionResponseResolver>(RadioQuestionResponseResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('RadioQuestionResponse', () => {
    it('returns RadioQuestionResponse', async () => {
      expect(resolver.radioQuestionResponseCreate(response)).resolves.toEqual(responseresponse)      
    })
  })
})
