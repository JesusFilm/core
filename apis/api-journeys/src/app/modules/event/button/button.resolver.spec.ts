import { Test, TestingModule } from '@nestjs/testing'

import {
  ButtonAction,
  ButtonClickEventCreateInput,
  ChatOpenEventCreateInput,
  MessagePlatform
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

import {
  ButtonClickEventResolver,
  ChatOpenEventResolver
} from './button.resolver'

describe('ButtonClickEventResolver', () => {
  let resolver: ButtonClickEventResolver, prismaService: PrismaService

  const response = {
    visitor: { id: 'visitor.id' },
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'visitor.id',
      activityCount: 0
    },
    journeyId: 'journey.id'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ButtonClickEventResolver, eventService, PrismaService]
    }).compile()
    resolver = module.get<ButtonClickEventResolver>(ButtonClickEventResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.visitor.update = jest.fn().mockResolvedValueOnce(null)
    prismaService.journeyVisitor.update = jest.fn().mockResolvedValueOnce(null)
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
        typename: 'ButtonClickEvent',
        visitor: {
          connect: { id: 'visitor.id' }
        },
        journey: { connect: { id: 'journey.id' } }
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

      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitor.id' },
        data: {
          lastLinkAction: 'https://test.com/some-link'
        }
      })
    })
  })
})

describe('ChatOpenEventResolver', () => {
  let resolver: ChatOpenEventResolver, prismaService: PrismaService

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const response = {
    visitor: { id: 'visitor.id', messagePlatform: MessagePlatform.facebook },
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'visitor.id',
      activityCount: 0
    },
    journeyId: 'journey.id'
  }

  const newResponse = {
    visitor: { id: 'newVisitor.id' },
    journeyVisitor: {
      journeyId: 'journey.id',
      visitorId: 'newVisitor.id',
      activityCount: 0
    },
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
      }),
      sendEventsEmail: jest.fn()
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatOpenEventResolver, eventService, PrismaService]
    }).compile()
    resolver = module.get<ChatOpenEventResolver>(ChatOpenEventResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.visitor.update = jest.fn().mockResolvedValueOnce(null)
    prismaService.journeyVisitor.update = jest.fn().mockResolvedValueOnce(null)
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
        typename: 'ChatOpenEvent',
        visitor: {
          connect: { id: 'visitor.id' }
        },
        journey: { connect: { id: 'journey.id' } }
      })
    })

    it('should return ChatOpenEvent with a custom value', async () => {
      const input: ChatOpenEventCreateInput = {
        id: '1',
        blockId: 'block.id',
        stepId: 'step.id',
        value: MessagePlatform.custom
      }

      expect(await resolver.chatOpenEventCreate('userId', input)).toEqual({
        ...input,
        typename: 'ChatOpenEvent',
        visitor: {
          connect: { id: 'visitor.id' }
        },
        journey: { connect: { id: 'journey.id' } }
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

      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'newVisitor.id' },
        data: {
          messagePlatform: MessagePlatform.facebook,
          lastChatStartedAt: new Date(),
          lastChatPlatform: MessagePlatform.facebook
        }
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

      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitor.id' },
        data: {
          lastChatStartedAt: new Date(),
          lastChatPlatform: MessagePlatform.facebook,
          messagePlatform: MessagePlatform.facebook
        }
      })
      expect(prismaService.journeyVisitor.update).toHaveBeenCalledWith({
        where: {
          journeyId_visitorId: {
            journeyId: 'journey.id',
            visitorId: 'visitor.id'
          }
        },
        data: {
          lastChatStartedAt: new Date(),
          lastChatPlatform: MessagePlatform.facebook,
          activityCount: 1
        }
      })
    })

    it('returns object for federation', () => {
      expect(
        resolver.messagePlatform({ value: MessagePlatform.facebook })
      ).toEqual(MessagePlatform.facebook)
    })
  })
})
