import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { TextResponseSubmissionEventResolver } from './textResponse.resolver'

describe('TextResponseEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: TextResponseSubmissionEventResolver

  const input = {
    id: '1',
    blockId: '2',
    value: 'My response'
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
      providers: [TextResponseSubmissionEventResolver, eventService]
    }).compile()
    resolver = module.get<TextResponseSubmissionEventResolver>(
      TextResponseSubmissionEventResolver
    )
  })

  describe('textResponseSubmissionEventCreate', () => {
    it('returns TextResponseSubmissionEvent', async () => {
      expect(
        await resolver.textResponseSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        __typename: 'TextResponseSubmissionEvent',
        userId: 'userId',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })
  })
})
