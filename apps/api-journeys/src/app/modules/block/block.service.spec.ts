import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionRemoveResult,
  mockCollectionSaveResult,
  mockCollectionUpdateAllResult,
  mockDbQueryResult
} from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  Block
} from '../../__generated__/graphql'
import { BlockService } from './block.service'

describe('BlockService', () => {
  let service: BlockService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<BlockService>(BlockService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const blockResponse = {
    id: '1',
    journeyId: '2',
    __typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  const journey = {
    id: '1',
    title: 'published',
    createdAt: '1234',
    status: JourneyStatus.published,
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug'
  }

  describe('getAll', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block, block])
      )
    })

    it('should return an array of all blocks', async () => {
      expect(await service.getAll()).toEqual([block, block])
    })
  })

  describe('forJourney', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block, block])
      )
    })

    it('should return all blocks in a journey', async () => {
      expect(await service.forJourney(journey)).toEqual([block, block])
    })
  })

  describe('getSiblings', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block, block])
      )
    })

    it('should return all siblings of a block', async () => {
      expect(
        await service.getSiblings(block.journeyId, block.parentBlockId)
      ).toEqual([block, block])
    })
  })

  describe('get', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block])
      )
    })

    it('should return a block', async () => {
      expect(await service.get('1')).toEqual(block)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(
        mockCollectionSaveResult(service.collection, block)
      )
    })

    it('should return a saved block', async () => {
      expect(await service.save(block)).toEqual(block)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).update.mockReturnValue(
        mockCollectionSaveResult(service.collection, block)
      )
    })

    it('should return an updated block', async () => {
      expect(await service.update(block._key, block)).toEqual(block)
    })
  })

  describe('reorderSiblings', () => {
    it('should update parent order', async () => {
      service.updateAll = jest.fn().mockReturnValue([
        { ...block, parentOrder: 0 },
        { ...block, parentOrder: 1 }
      ])
      expect(
        await service.reorderSiblings([
          { _key: block._key, parentOrder: 2 },
          { _key: block._key, parentOrder: 3 }
        ])
      ).toEqual([
        { ...block, parentOrder: 0 },
        { ...block, parentOrder: 1 }
      ])
      expect(service.updateAll).toHaveBeenCalledWith([
        { _key: block._key, parentOrder: 0 },
        { _key: block._key, parentOrder: 1 }
      ])
    })
  })

  describe('updateChildrenParentOrder', () => {
    it('should update parent order', async () => {
      service.getSiblings = jest.fn().mockReturnValue([
        { _key: block._key, parentOrder: 1 },
        { _key: block._key, parentOrder: 2 },
        { _key: block._key, parentOrder: null }
      ])
      service.reorderSiblings = jest.fn().mockReturnValue([
        { _key: block._key, parentOrder: 0 },
        { _key: block._key, parentOrder: 1 }
      ])
      expect(await service.updateChildrenParentOrder('1', '2')).toEqual([
        { _key: block._key, parentOrder: 0 },
        { _key: block._key, parentOrder: 1 }
      ])
      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { _key: block._key, parentOrder: 1 },
        { _key: block._key, parentOrder: 2 }
      ])
    })
  })

  describe('removeBlockAndChildren', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block, block])
      )
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).remove.mockReturnValue(
        mockCollectionRemoveResult(service.collection, block)
      )
      service.updateChildrenParentOrder = jest.fn(
        async () =>
          await Promise.resolve([
            { _key: block._key, parentOrder: 0 } as unknown as Block,
            { _key: block._key, parentOrder: 1 } as unknown as Block
          ])
      )
    })

    it('should remove blocks and return siblings', async () => {
      expect(
        await service.removeBlockAndChildren(
          block._key,
          block.parentBlockId,
          journey.id
        )
      ).toEqual([
        { _key: block._key, parentOrder: 0 },
        { _key: block._key, parentOrder: 1 }
      ])
      expect(service.updateChildrenParentOrder).toHaveBeenCalledWith(
        journey.id,
        block.parentBlockId
      )
    })

    it('should update parent order', async () => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).updateAll.mockReturnValue(
        mockCollectionUpdateAllResult(service.collection, [
          { _key: block._key, new: block },
          { _key: block._key, new: block }
        ])
      )
      service.getSiblings = jest.fn(
        async () => await Promise.resolve([blockResponse, blockResponse])
      )
      expect(
        await service.updateChildrenParentOrder(journey.id, block.parentBlockId)
      ).toEqual([
        { _key: block._key, parentOrder: 0 },
        { _key: block._key, parentOrder: 1 }
      ])
    })

    describe('validateBlock', () => {
      beforeEach(() => {
        ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
          mockDbQueryResult(service.db, [block])
        )
      })
      it('should return false with non-existent id', async () => {
        expect(await service.validateBlock(null, '1')).toEqual(false)
      })
      it('should return false with incorrect parent id', async () => {
        expect(await service.validateBlock('1', 'wrongParent')).toEqual(false)
      })
      it('should validate block', async () => {
        expect(await service.validateBlock('1', '3')).toEqual(true)
      })
    })
  })
})
