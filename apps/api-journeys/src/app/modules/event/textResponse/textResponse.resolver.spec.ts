import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { TextResponseSubmissionEventCreateInput } from '../../../__generated__/graphql'
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

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
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
      const input: TextResponseSubmissionEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        label: 'stepName',
        value: 'My response'
      }

      expect(
        await resolver.textResponseSubmissionEventCreate('userId', input)
      ).toEqual({
        ...input,
        __typename: 'TextResponseSubmissionEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })
  })
})
