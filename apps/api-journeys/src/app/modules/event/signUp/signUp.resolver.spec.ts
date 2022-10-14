import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { SignUpSubmissionEventResolver } from './signUp.resolver'

describe('SignUpEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

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
      save: jest.fn((input) => input),
      getBlockById: jest.fn(() => block)
    })
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id'
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
      ).toEqual({
        ...input,
        __typename: 'SignUpSubmissionEvent',
        userId: 'userId',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })
  })
})
