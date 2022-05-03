import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { SignUpResponseResolver } from './signUp.resolver' // change

describe('SignUpResponseResolver', () => {
  let resolver: SignUpResponseResolver

  const event = {
    id: '1',
    __typename: 'SignUpEvent',
    blockId: '2',
    userId: '3',
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn(() => event)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignUpResponseResolver, eventService]
    }).compile()
    resolver = module.get<SignUpResponseResolver>(SignUpResponseResolver)
  })

  describe('SignUpResponse', () => {
    it('returns SignUpResponse', async () => {
      expect(await resolver.signUpResponseCreate(event)).toEqual(event)
    })
  })
})
