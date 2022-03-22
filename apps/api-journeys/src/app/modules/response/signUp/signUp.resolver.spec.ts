import { Test, TestingModule } from '@nestjs/testing'
import { ResponseService } from '../response.service'
import { SignUpResponseResolver } from './signUp.resolver'

describe('SignUpResponseResolver', () => {
  let resolver: SignUpResponseResolver

  const response = {
    id: '1',
    __typename: 'SignUpResponse',
    blockId: '2',
    userId: '3',
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
  }

  const responseService = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response)
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
      expect(await resolver.signUpResponseCreate(response)).toEqual(response)
    })
  })
})
