import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { Action, RadioOptionBlock } from '../../__generated__/graphql'
import { BlockResolver } from '../block/block.resolver'
import { BlockService } from '../block/block.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { ActionResolver } from './action.resolver'

describe('ActionResolver', () => {
  let resolver: ActionResolver,
    blockResolver: BlockResolver,
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
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const blockResponse1 = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      parentBlockId: '1',
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
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const blockResponse2 = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      parentBlockId: '1',
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
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  const blockResponse3 = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      parentBlockId: '1',
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
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  const blockResponse4 = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      url: 'https://google.com'
    }
  }

  describe('__resolveType', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block1)
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
      resolver = module.get<ActionResolver>(ActionResolver)
    })

    it('returns NavigateAction', () => {
      const action = {
        blockId: null,
        journeyId: null,
        url: null,
        target: null
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('NavigateAction')
    })

    it('returns NavigateToBlockAction', () => {
      const action = {
        blockId: '4',
        journeyId: null,
        url: null,
        target: null
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('NavigateToBlockAction')
    })

    it('returns NavigateToJourneyAction', () => {
      const action = {
        blockId: null,
        journeyId: '4',
        url: null,
        target: null
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('NavigateToJourneyAction')
    })

    it('returns LinkAction', () => {
      const action = {
        blockId: null,
        journeyId: null,
        url: 'https://google.com',
        target: 'target'
      } as unknown as Action
      expect(resolver.__resolveType(action)).toBe('LinkAction')
    })
  })

  describe('NavigateToBlockAction', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block1)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [BlockResolver, blockService]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
    })
    it('returns NavigateToBlockAction', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse1)
      expect(
        ((await blockResolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('blockId')
    })
  })

  describe('NavigateToJourneyAction', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block2)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [BlockResolver, blockService]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
    })
    it('returns NavigateToBlockAction', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse2)
      expect(
        ((await blockResolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('journeyId')
    })
  })

  describe('LinkAction', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block3)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [BlockResolver, blockService]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
    })
    it('returns LinkAction', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse3)
      expect(
        ((await blockResolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('url')
    })
  })

  describe('NavigateAction', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block4)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [BlockResolver, blockService]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
    })
    it('returns NavigateAction', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse4)
    })
  })

  describe('blockRemoveAction', () => {
    const emptyAction = { action: null }
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block1),
          update: jest.fn(() => emptyAction)
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
      resolver = module.get<ActionResolver>(ActionResolver)
      service = await module.resolve(BlockService)
    })
    it('removes the block action', async () => {
      await resolver.blockRemoveAction(block1._key, block1.journeyId)

      expect(service.update).toHaveBeenCalledWith(block1._key, {
        action: null
      })
    })
  })
})
