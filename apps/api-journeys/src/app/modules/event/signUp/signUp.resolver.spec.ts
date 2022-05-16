import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { SignUpSubmissionEventResolver } from './signUp.resolver'

describe('SignUpEventResolver', () => {
  let resolver: SignUpSubmissionEventResolver

  const input = {
    id: '1',
    blockId: '2',
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input)
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
      expect(
        await resolver.signUpSubmissionEventCreate('userId', input)
<<<<<<< HEAD
      ).toEqual({
        ...input,
        __typename: 'SignUpSubmissionEvent',
        userId: 'userId'
      })
=======
      ).toEqual({ ...input, userId: 'userId' })
>>>>>>> b3b3c7f5 (chore: fix naming)
    })
  })
})
