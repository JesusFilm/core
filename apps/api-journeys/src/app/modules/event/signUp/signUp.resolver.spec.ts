import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
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

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      getVisitorByUserIdAndTeamId: jest.fn(() => visitorWithId)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }

  const input = {
    id: '1',
    blockId: '2',
    name: 'Robert Smith',
    email: 'robert.smith@jesusfilm.org'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignUpSubmissionEventResolver, eventService, blockService]
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
        id: input.id,
        blockId: input.blockId,
        __typename: 'SignUpSubmissionEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: 'step.id', // TODO
        label: null,
        value: input.name,
        email: input.email
      })
    })
  })
})
