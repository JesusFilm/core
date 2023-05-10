import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import {
  ButtonAction,
  ButtonClickEventCreateInput,
  ChatOpenEventCreateInput,
  MessagePlatform
} from '../../../__generated__/graphql'
import { VisitorService } from '../../visitor/visitor.service'
import {
  ButtonClickEventResolver,
  ChatOpenEventResolver
} from './button.resolver'

describe('ButtonClickEventResolver', () => {
  let resolver: ButtonClickEventResolver, vService: VisitorService

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const response = {
    visitor: { id: 'visitor.id' },
    journeyId: 'journey.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      update: jest.fn(() => null)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ButtonClickEventResolver, eventService, visitorService]
    }).compile()
    resolver = module.get<ButtonClickEventResolver>(ButtonClickEventResolver)
    vService = module.get<VisitorService>(VisitorService)
  })

  describe('buttonClickEventCreate', () => {
    it('returns ButtonClickEvent', async () => {
      const input: ButtonClickEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        label: 'Step name',
        value: 'Button label',
        action: ButtonAction.NavigateToBlockAction,
        actionValue: 'Step 1'
      }

      expect(await resolver.buttonClickEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'ButtonClickEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })

    it('should update visitor last link action', async () => {
      const input: ButtonClickEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        label: 'Step name',
        value: 'Button label',
        action: ButtonAction.LinkAction,
        actionValue: 'https://test.com/some-link'
      }
      await resolver.buttonClickEventCreate('userId', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastLinkAction: 'https://test.com/some-link'
      })
    })
  })
})

describe('ChatOpenEventResolver', () => {
  let resolver: ChatOpenEventResolver, vService: VisitorService

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const response = {
    visitor: { id: 'visitor.id', messagePlatform: MessagePlatform.facebook },
    journeyId: 'journey.id'
  }

  const newResponse = {
    visitor: { id: 'newVisitor.id' },
    journeyId: 'journey.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn((userId) => {
        switch (userId) {
          case 'userId':
            return response
          default:
            return newResponse
        }
      })
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      update: jest.fn(() => null)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatOpenEventResolver, eventService, visitorService]
    }).compile()
    resolver = module.get<ChatOpenEventResolver>(ChatOpenEventResolver)
    vService = module.get<VisitorService>(VisitorService)
  })

  describe('chatOpenEventCreate', () => {
    it('should return ChatOpenEvent', async () => {
      const input: ChatOpenEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        value: MessagePlatform.facebook
      }

      expect(await resolver.chatOpenEventCreate('userId', input)).toEqual({
        ...input,
        __typename: 'ChatOpenEvent',
        visitorId: 'visitor.id',
        createdAt: new Date().toISOString(),
        journeyId: 'journey.id'
      })
    })

    it('should update visitor messagePlatform', async () => {
      const input: ChatOpenEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        value: MessagePlatform.facebook
      }

      await resolver.chatOpenEventCreate('newUserId', input)

      expect(vService.update).toHaveBeenCalledWith('newVisitor.id', {
        messagePlatform: MessagePlatform.facebook,
        lastChatStartedAt: new Date().toISOString(),
        lastChatPlatform: MessagePlatform.facebook
      })
    })

    it('should update visitor', async () => {
      const input: ChatOpenEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        value: MessagePlatform.facebook
      }
      await resolver.chatOpenEventCreate('userId', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastChatStartedAt: new Date().toISOString(),
        lastChatPlatform: MessagePlatform.facebook
      })
    })

    it('returns object for federation', () => {
      expect(
        resolver.messagePlatform({ value: MessagePlatform.facebook })
      ).toEqual(MessagePlatform.facebook)
    })
  })
})
