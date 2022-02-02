import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { Action, RadioOptionBlock } from '../../__generated__/graphql'
import { BlockResolvers } from '../block/block.resolvers'
import { BlockService } from '../block/block.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { ActionResolver } from './action.resolvers'

describe('ActionResolvers', () => {
  let resolver: BlockResolvers,
    actionResolver: ActionResolver,
    service: BlockService

  const block1 = {
    _key: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const block1response = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const block2 = {
    _key: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const block2response = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const block3 = {
    _key: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  const block3response = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  const block4 = {
    _key: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  const block4response = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  const navigateToBlockInput = {
    gtmEventName: 'gtmEventName',
    blockId: '4',
    journeyId: null,
    url: null,
    target: null
  }

  const navigateToJourneyInput = {
    gtmEventName: 'gtmEventName',
    journeyId: '4',
    blockId: null,
    url: null,
    target: null
  }

  const linkActionInput = {
    gtmEventName: 'gtmEventName',
    url: 'https://google.com',
    blockId: null,
    journeyId: null
  }

  const navigateActionInput = {
    gtmEventName: 'gtmEventName',
    blockId: null,
    journeyId: null,
    url: null,
    target: null
  }

  describe('__resolveType', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block1),
          update: jest.fn((navigateToBlockInput) => navigateToBlockInput)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          blockService,
          ActionResolver,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      actionResolver = module.get<ActionResolver>(ActionResolver)
    })

    it('returns NavigateAction when blockId is null', () => {
      const action = { blockId: null } as unknown as Action
      expect(actionResolver.__resolveType(action)).toBe('NavigateAction')
    })
  })

  describe('NavigateToBlockAction', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block1),
          update: jest.fn((navigateToBlockInput) => navigateToBlockInput)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolvers,
          blockService,
          ActionResolver,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      actionResolver = module.get<ActionResolver>(ActionResolver)
      resolver = module.get<BlockResolvers>(BlockResolvers)
      service = await module.resolve(BlockService)
    })
    it('returns NavigateToBlockAction', async () => {
      expect(await resolver.block('1')).toEqual(block1response)
      expect(
        ((await resolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('blockId')
    })

    it('updates the navigate to block action', async () => {
      await actionResolver.blockUpdateNavigateToBlockAction(
        block1._key,
        block1.journeyId,
        navigateToBlockInput
      )
      expect(service.update).toHaveBeenCalledWith(block1._key, {
        action: { ...navigateToBlockInput }
      })
    })
  })

  describe('NavigateToJourneyAction', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block2),
          update: jest.fn((navigateToJourneyInput) => navigateToJourneyInput)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolvers,
          blockService,
          ActionResolver,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      actionResolver = module.get<ActionResolver>(ActionResolver)
      resolver = module.get<BlockResolvers>(BlockResolvers)
      service = await module.resolve(BlockService)
    })
    it('returns NavigateToBlockAction', async () => {
      expect(await resolver.block('1')).toEqual(block2response)
      expect(
        ((await resolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('journeyId')
    })

    it('updates the navigate to journey action', async () => {
      await actionResolver.blockUpdateNavigateToJourneyAction(
        block2._key,
        block2.journeyId,
        navigateToJourneyInput
      )
      expect(service.update).toHaveBeenCalledWith(block2._key, {
        action: { ...navigateToJourneyInput }
      })
    })
  })

  describe('LinkAction', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block3),
          update: jest.fn((linkActionInput) => linkActionInput)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolvers,
          blockService,
          ActionResolver,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      actionResolver = module.get<ActionResolver>(ActionResolver)
      resolver = module.get<BlockResolvers>(BlockResolvers)
      service = await module.resolve(BlockService)
    })
    it('returns LinkAction', async () => {
      expect(await resolver.block('1')).toEqual(block3response)
      expect(
        ((await resolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('url')
    })

    it('updates link action', async () => {
      await actionResolver.blockUpdateLinkAction(
        block3._key,
        block3.journeyId,
        linkActionInput
      )
      expect(service.update).toHaveBeenCalledWith(block3._key, {
        action: { ...linkActionInput }
      })
    })
  })

  describe('NavigateAction', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block4),
          update: jest.fn((navigateActionInput) => navigateActionInput)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolvers,
          blockService,
          ActionResolver,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      actionResolver = module.get<ActionResolver>(ActionResolver)
      resolver = module.get<BlockResolvers>(BlockResolvers)
      service = await module.resolve(BlockService)
    })
    it('returns NavigateAction', async () => {
      expect(await resolver.block('1')).toEqual(block4response)
    })

    it('updates navigate action', async () => {
      await actionResolver.blockUpdateNavigateAction(
        block4._key,
        block4.journeyId,
        navigateActionInput
      )
      expect(service.update).toHaveBeenCalledWith(block4._key, {
        action: { ...navigateActionInput }
      })
    })
  })
})
