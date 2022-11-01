import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from '../event.service'
import {
  ButtonClickEventCreateInput,
  ChatOpenedEventCreateInput,
  MessagePlatform
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'
import { VisitorService } from '../../visitor/visitor.service'
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

  const block = {
    id: 'block.id',
    _key: 'block.id',
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
        const errorInput: ButtonClickEventCreateInput = {
          ...input,
          stepId: 'errorStep.id'
        }

        await expect(
          async () =>
            await resolver.buttonClickEventCreate('userId', errorInput)
        ).rejects.toThrow(
          `Step ID ${
            errorInput.stepId as string
          } does not exist on Journey with ID ${block.journeyId}`
        )
      })
    })
  })

  describe('chatOpenedEventCreate', () => {
    let resolver: ChatOpenedEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ChatOpenedEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<ChatOpenedEventResolver>(ChatOpenedEventResolver)
    })

    it('should return ChatOpenedEvent', async () => {
      const chatOpenInput: ChatOpenedEventCreateInput = {
        ...input,
        value: MessagePlatform.facebook
      }

      expect(
        await resolver.chatOpenedEventCreate('userId', chatOpenInput)
      ).toEqual({
        ...chatOpenInput,
        __typename: 'ChatOpenedEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      const chatErrorInput: ChatOpenedEventCreateInput = {
        ...input,
        stepId: 'anotherStep.id',
        value: MessagePlatform.facebook
      }

      await expect(
        async () =>
          await resolver.chatOpenedEventCreate('userId', chatErrorInput)
      ).rejects.toThrow(
        `Step ID ${
          chatErrorInput.stepId as string
        } does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })
})
