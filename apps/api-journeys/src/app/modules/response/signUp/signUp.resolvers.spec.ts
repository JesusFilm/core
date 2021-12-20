import { Test, TestingModule } from '@nestjs/testing'
import { SignUpResponseResolver } from './signUp.resolvers'
import { ResponseService } from '../response.service'

describe('SignUpResponse', () => {
  let resolver: SignUpResponseResolver

  const response = {
    _key: "1",
    __typename: 'SignUpResponse',
    blockId: "2",
    userId: "3",
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
  }

  const responseresponse ={
    id: "1",
    __typename: 'SignUpResponse',
    blockId: "2",
    userId: "3",
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
  }

  const responseService = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response),      
    })
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignUpResponseResolver, responseService]
    }).compile()
    resolver = module.get<SignUpResponseResolver>(SignUpResponseResolver)
  })

  describe('SignUpResponse', () => {
    it('returns SignUpResponse', async () => {
      expect(resolver.signUpResponseCreate(response)).resolves.toEqual(responseresponse)      
    })
  })
})
