import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import {
  ButtonClickEventCreateInput,
  ChatOpenedEventCreateInput,
  MessagePlatform
} from '../../../__generated__/graphql'
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
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
    journeyId: 'journey.id'
  }

  describe('buttonClickEventCreate', () => {
    let resolver: ButtonClickEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ButtonClickEventResolver, eventService]
      }).compile()
      resolver = module.get<ButtonClickEventResolver>(ButtonClickEventResolver)
    })

    it('returns ButtonClickEvent', async () => {
      const input: ButtonClickEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        label: 'Step name',
        value: 'Button label'
      }

      expect(await resolver.buttonClickEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'ButtonClickEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })
  })

  describe('chatOpenedEventCreate', () => {
    let resolver: ChatOpenedEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ChatOpenedEventResolver, eventService]
      }).compile()
      resolver = module.get<ChatOpenedEventResolver>(ChatOpenedEventResolver)
    })

    it('should return ChatOpenedEvent', async () => {
      const input: ChatOpenedEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        value: MessagePlatform.facebook
      }

      expect(await resolver.chatOpenedEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'ChatOpenedEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })
  })
})
