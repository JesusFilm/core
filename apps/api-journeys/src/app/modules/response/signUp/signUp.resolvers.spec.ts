import { Test, TestingModule } from '@nestjs/testing'
import { SignUpResponseResolver } from './signUp.resolvers'
import { ResponseService } from '../response.service'

describe('SignUpResponse', () => {
  let resolver: SignUpResponseResolver

  const response = {
    _key: "1",
    type: 'SignUpResponse',
    blockId: "2",
    userId: "3",
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
  }

  const responseresponse ={
    id: "1",
    type: 'SignUpResponse',
    blockId: "2",
    userId: "3",
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
  }

  const responseservice = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response),      
    })
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignUpResponseResolver, responseservice]
    }).compile()
    resolver = module.get<SignUpResponseResolver>(SignUpResponseResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('SignUpResponse', () => {
    it('returns SignUpResponse', async () => {
      expect(resolver.signUpResponseCreate(response)).resolves.toEqual(responseresponse)      
    })
  })
})
