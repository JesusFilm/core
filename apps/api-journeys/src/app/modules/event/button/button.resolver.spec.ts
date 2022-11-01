import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import { ButtonClickEventCreateInput } from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'
import { VisitorService } from '../../visitor/visitor.service'
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
      save: jest.fn((event) => event)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      validateBlock: jest.fn((id) => {
        switch (id) {
          case 'step.id':
            return true
          default:
            return false
        }
      })
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getByUserIdAndJourneyId: jest.fn(() => visitorWithId)
    })
  }

  const input: ButtonClickEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    stepId: 'step.id',
    label: 'Step name',
    value: 'Button label'
  }

  const errorInput: ButtonClickEventCreateInput = {
    ...input,
    stepId: 'errorStep.id'
  }

  const block = {
    id: 'block.id',
    _key: 'block.id',
    journeyId: 'journey.id'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ButtonClickEventResolver,
        eventService,
        blockService,
        visitorService
      ]
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
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      await expect(
        async () => await resolver.buttonClickEventCreate('userId', errorInput)
      ).rejects.toThrow(
        `Step ID ${
          errorInput.stepId as string
        } does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })
})
