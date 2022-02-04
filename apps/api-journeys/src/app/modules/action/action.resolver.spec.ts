import { Test, TestingModule } from '@nestjs/testing'
import { RadioOptionBlock } from '../../__generated__/graphql'
import { BlockResolver } from '../block/block.resolver'
import { BlockService } from '../block/block.service'

describe('ActionResolver', () => {
  let blockResolver: BlockResolver

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

  const blockResponse1 = {
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

  const blockResponse2 = {
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

  const blockResponse3 = {
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

  const blockResponse4 = {
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
})
