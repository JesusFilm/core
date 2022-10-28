import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { ButtonClickEventCreateInput } from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'
import { ButtonClickEventResolver } from './button.resolver'

describe('ButtonClickEventResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  let resolver: ButtonClickEventResolver

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      getStepHeader: jest.fn((parentBlockId) => {
        switch (parentBlockId) {
          case block.parentBlockId:
            return 'header'
          case untitledStepNameBlock.parentBlockId:
            return 'Untitled'
        }
      }),
      getVisitorByUserIdAndJourneyId: jest.fn(() => visitorWithId),
      getParentStepBlockByBlockId: jest.fn(() => stepBlock)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn((blockId) => {
        switch (blockId) {
          case block.id:
            return block
          case untitledStepNameBlock.id:
            return untitledStepNameBlock
        }
      })
    })
  }

  const input: ButtonClickEventCreateInput = {
    id: '1',
    blockId: 'block.id'
  }

  const untitledStepInput: ButtonClickEventCreateInput = {
    id: '2',
    blockId: 'untitledStepNameBlock.id'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    label: 'label'
  }

  const untitledStepNameBlock = {
    ...block,
    id: 'untitledStepNameBlock.id',
    parentBlockId: 'untitled'
  }

  const stepBlock = {
    __typename: 'StepBlock',
    id: 'stepBlock.id',
    parentBlockId: null,
    journeyId: 'journey.id',
    locked: false
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ButtonClickEventResolver, eventService, blockService]
    }).compile()
    resolver = module.get<ButtonClickEventResolver>(ButtonClickEventResolver)
  })

  describe('buttonClickEventCreate', () => {
    it('returns ButtonClickEvent', async () => {
      expect(await resolver.buttonClickEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'ButtonClickEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: 'header',
        value: block.label
      })
    })

    it('should return event with untitled label', async () => {
      expect(
        await resolver.buttonClickEventCreate('userId', untitledStepInput)
      ).toEqual({
        ...untitledStepInput,
        __typename: 'ButtonClickEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: untitledStepNameBlock.journeyId,
        stepId: stepBlock.id,
        label: 'Untitled',
        value: untitledStepNameBlock.label
      })
    })
  })
})
