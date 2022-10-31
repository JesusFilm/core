import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
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
      getVisitorByUserIdAndJourneyId: jest.fn(() => visitorWithId)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }

  const input: TextResponseSubmissionEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    stepId: 'step.id',
    label: 'stepName',
    value: 'My response'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    label: 'textResponse.label'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextResponseSubmissionEventResolver,
        eventService,
        blockService
      ]
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
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })
  })
})
