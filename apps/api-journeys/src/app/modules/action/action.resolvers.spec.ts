import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { Action, RadioOptionBlock } from '../../__generated__/graphql'
import { BlockResolvers } from '../block/block.resolvers'
import { BlockService } from '../block/block.service'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { ActionResolver } from './action.resolvers'

describe('ActionResolvers', () => {
  let resolver: BlockResolvers, actionResolver: ActionResolver

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

    it('returns NavigateAction', () => {
      const action = {
        blockId: null,
        journeyId: null,
        url: null,
        target: null
      } as unknown as Action
      expect(actionResolver.__resolveType(action)).toBe('NavigateAction')
    })

    it('returns NavigateToBlockAction', () => {
      const action = {
        blockId: '4',
        journeyId: null,
        url: null,
        target: null
      } as unknown as Action
      expect(actionResolver.__resolveType(action)).toBe('NavigateToBlockAction')
    })

    it('returns NavigateToJourneyAction', () => {
      const action = {
        blockId: null,
        journeyId: '4',
        url: null,
        target: null
      } as unknown as Action
      expect(actionResolver.__resolveType(action)).toBe(
        'NavigateToJourneyAction'
      )
    })

    it('returns LinkAction', () => {
      const action = {
        blockId: null,
        journeyId: null,
        url: 'https://google.com',
        target: 'target'
      } as unknown as Action
      expect(actionResolver.__resolveType(action)).toBe('LinkAction')
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
        providers: [BlockResolvers, blockService]
      }).compile()
      resolver = module.get<BlockResolvers>(BlockResolvers)
    })
    it('returns NavigateToBlockAction', async () => {
      expect(await resolver.block('1')).toEqual(block1response)
      expect(
        ((await resolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('blockId')
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
        providers: [BlockResolvers, blockService]
      }).compile()
      resolver = module.get<BlockResolvers>(BlockResolvers)
    })
    it('returns NavigateToBlockAction', async () => {
      expect(await resolver.block('1')).toEqual(block2response)
      expect(
        ((await resolver.block('1')) as RadioOptionBlock).action
      ).toHaveProperty('journeyId')
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
        providers: [BlockResolvers, blockService]
      }).compile()
      resolver = module.get<BlockResolvers>(BlockResolvers)
    })
    it('returns LinkAction', async () => {
      expect(await resolver.block('1')).toEqual(block3response)
      expect(
        ((await resolver.block('1')) as RadioOptionBlock).action
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
        providers: [BlockResolvers, blockService]
      }).compile()
      resolver = module.get<BlockResolvers>(BlockResolvers)
    })
    it('returns NavigateAction', async () => {
      expect(await resolver.block('1')).toEqual(block4response)
    })
  })
})
