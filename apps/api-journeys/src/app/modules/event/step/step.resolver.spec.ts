import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import { StepViewEventCreateInput } from '../../../__generated__/graphql'
import { VisitorService } from '../../visitor/visitor.service'
import { StepViewEventResolver } from './step.resolver'

describe('StepViewEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: StepViewEventResolver

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((input) => input)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getByUserIdAndJourneyId: jest.fn(() => visitorWithId)
    })
  }

  const input: StepViewEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    value: 'stepName'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    locked: false
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StepViewEventResolver,
        eventService,
        blockService,
        visitorService
      ]
    }).compile()
    resolver = module.get<StepViewEventResolver>(StepViewEventResolver)
  })

  describe('stepViewEventCreate', () => {
    it('returns StepViewEvent', async () => {
      expect(await resolver.stepViewEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'StepViewEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: input.blockId
      })
    })
  })
})
