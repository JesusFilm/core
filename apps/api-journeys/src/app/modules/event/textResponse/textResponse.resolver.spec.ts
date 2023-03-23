import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { TextResponseSubmissionEventCreateInput } from '../../../__generated__/graphql'
import { VisitorService } from '../../visitor/visitor.service'
import { TextResponseSubmissionEventResolver } from './textResponse.resolver'

describe('TextResponseEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: TextResponseSubmissionEventResolver, vService: VisitorService

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      update: jest.fn(() => null)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
    journeyId: 'journey.id'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextResponseSubmissionEventResolver,
        eventService,
        visitorService
      ]
    }).compile()
    resolver = module.get<TextResponseSubmissionEventResolver>(
      TextResponseSubmissionEventResolver
    )
    vService = module.get<VisitorService>(VisitorService)
  })

  describe('textResponseSubmissionEventCreate', () => {
    const input: TextResponseSubmissionEventCreateInput = {
      id: '1',
      blockId: 'block.id',
      stepId: 'step.id',
      label: 'stepName',
      value: 'My response'
    }
    it('returns TextResponseSubmissionEvent', async () => {
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

    it('should update visitor last event at', async () => {
      await resolver.textResponseSubmissionEventCreate('userId', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastEventAt: new Date().toISOString()
      })
    })
  })
})
