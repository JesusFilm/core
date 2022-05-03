import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { SignUpEventResolver } from './signUp.resolver'

describe('SignUpEventResolver', () => {
  let resolver: SignUpEventResolver

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
      providers: [SignUpEventResolver, eventService]
    }).compile()
    resolver = module.get<SignUpEventResolver>(SignUpEventResolver)
  })

  describe('SignUpEvent', () => {
    it('returns SignUpEvent', async () => {
      expect(await resolver.signUpEventCreate(event)).toEqual(event)
    })
  })
})
