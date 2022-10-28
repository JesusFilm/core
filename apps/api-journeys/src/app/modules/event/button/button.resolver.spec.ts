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
          case buttonBlock.id:
            return buttonBlock
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

  const linkButtonInput: ChatOpenedEventCreateInput = {
    id: '3',
    blockId: 'buttonBlock.id'
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

  const buttonBlock = {
    ...block,
    id: 'buttonBlock.id',
    action: {
      url: 'https://fb.me/some-user'
    }
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

  describe('ChatOpenedEventResolver', () => {
    let resolver: ChatOpenedEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ChatOpenedEventResolver, eventService, blockService]
      }).compile()
      resolver = module.get<ChatOpenedEventResolver>(ChatOpenedEventResolver)
    })

    describe('chatOpenedEventCreate', () => {
      it('returns ChatOpenedEvent', async () => {
        expect(
          await resolver.chatOpenedEventCreate('userId', linkButtonInput)
        ).toEqual({
          ...linkButtonInput,
          __typename: 'ChatOpenedEvent',
          visitorId: visitorWithId.id,
          createdAt: new Date().toISOString(),
          journeyId: buttonBlock.journeyId,
          stepId: stepBlock.id,
          label: null,
          value: 'Facebook'
        })
      })
    })
  })
})
