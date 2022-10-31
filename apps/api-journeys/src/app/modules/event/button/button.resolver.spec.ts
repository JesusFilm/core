import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import {
  ButtonClickEventCreateInput,
  ChatOpenedEventCreateInput
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'
import {
  ButtonClickEventResolver,
  ChatOpenedEventResolver
} from './button.resolver'

describe('Button', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      getVisitorByUserIdAndJourneyId: jest.fn(() => visitorWithId)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }

  const input: ButtonClickEventCreateInput = {
    id: '1',
    blockId: 'block.id',
    stepId: 'step.id',
    label: 'Step name',
    value: 'Button label'
  }

  const linkButtonInput: ChatOpenedEventCreateInput = {
    id: '3',
    blockId: 'buttonBlock.id'
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)
  describe('ButtonClickEventResolver', () => {
    let resolver: ButtonClickEventResolver

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
  })
})
