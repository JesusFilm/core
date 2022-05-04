import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { SignUpSubmissionEventResolver } from './signUp.resolver'

describe('SignUpEventResolver', () => {
  let resolver: SignUpSubmissionEventResolver

  const event = {
    id: '1',
    __typename: 'SignUpSubmissionEvent',
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
      providers: [SignUpSubmissionEventResolver, eventService]
    }).compile()
    resolver = module.get<SignUpSubmissionEventResolver>(
      SignUpSubmissionEventResolver
    )
  })

  describe('signUpSubmissionEventCreate', () => {
    it('returns SignUpSubmissionEvent', async () => {
      expect(await resolver.signUpSubmissionEventCreate(event)).toEqual(event)
    })
  })
})
