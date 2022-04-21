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
import { keyAsId } from '@core/nest/decorators'

import {
  Journey,
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

  const journey: Journey = {
    id: '1',
    title: 'published',
    createdAt: '1234',
    status: JourneyStatus.published,
    language: { id: '529' },
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlock: null,
    slug: 'published-slug'
  }

  const block = {
    _key: '1',
    journeyId: journey.id,
    __typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }
  const blockWithId = keyAsId(block)

  describe('getAll', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block, block])
      )
    })

    it('should return an array of all blocks', async () => {
      expect(await service.getAll()).toEqual([blockWithId, blockWithId])
    })
  })

  describe('forJourney', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block, block])
      )
    })

    it('should return all blocks in a journey', async () => {
      expect(await service.forJourney(journey)).toEqual([
        blockWithId,
        blockWithId
      ])
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
      ).toEqual([blockWithId, blockWithId])
    })
  })

  describe('get', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block])
      )
    })

    it('should return a block', async () => {
      expect(await service.get('1')).toEqual(blockWithId)
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
      expect(await service.save(block)).toEqual(blockWithId)
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
      expect(await service.update(block._key, block)).toEqual(blockWithId)
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

  describe('reorderBlock', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block, block])
      )
      service.reorderSiblings = jest.fn(
        async () =>
          await Promise.resolve([
            { _key: '2', parentOrder: 0 } as unknown as Block,
            { _key: block._key, parentOrder: 1 } as unknown as Block
          ])
      )
    })

    it('should update block order', async () => {
      service.getSiblingsInternal = jest
        .fn()
        .mockReturnValue([block, { ...block, _key: '2', parentOrder: 1 }])

      expect(await service.reorderBlock(block._key, journey.id, 1)).toEqual([
        { id: '2', parentOrder: 0 },
        { id: block._key, parentOrder: 1 }
      ])
      expect(service.reorderSiblings).toHaveBeenCalledWith([
        { ...block, _key: '2', parentOrder: 1 },
        block
      ])
    })
    it('does not update if block not part of current journey', async () => {
      expect(
        await service.reorderBlock(block.__typename, 'invalidJourney', 2)
      ).toEqual([])
      expect(service.reorderSiblings).toBeCalledTimes(0)
    })

    it('does not update if block does not have parent order', async () => {
      service.get = jest.fn().mockReturnValue({ ...block, parentOrder: null })

      expect(await service.reorderBlock(block._key, journey.id, 2)).toEqual([])
      expect(service.reorderSiblings).toBeCalledTimes(0)
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
      service.reorderSiblings = jest.fn(
        async () =>
          await Promise.resolve([
            { _key: block._key, parentOrder: 0 } as unknown as Block,
            { _key: block._key, parentOrder: 1 } as unknown as Block
          ])
      )
    })

    it('should remove blocks and return siblings', async () => {
      service.getSiblingsInternal = jest.fn().mockReturnValue([
        { _key: block._key, parentOrder: 1 },
        { _key: block._key, parentOrder: 2 }
      ])
      service.reorderSiblings = jest.fn().mockReturnValue([
        { _key: block._key, parentOrder: 0 },
        { _key: block._key, parentOrder: 1 }
      ])

      expect(
        await service.removeBlockAndChildren(
          block._key,
          journey.id,
          block.parentBlockId
        )
      ).toEqual([
        { id: block._key, parentOrder: 0 },
        { id: block._key, parentOrder: 1 }
      ])
      expect(service.getSiblingsInternal).toHaveBeenCalledWith(
        journey.id,
        block.parentBlockId
      )
    })

    it('should remove blocks and return empty array', async () => {
      expect(
        await service.removeBlockAndChildren(block._key, journey.id)
      ).toEqual([])
      expect(service.reorderSiblings).not.toHaveBeenCalled()
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
      const siblings = [blockWithId, blockWithId] as Block[]

      service.getSiblingsInternal = jest.fn(
        async () => await Promise.resolve(siblings)
      )
      expect(await service.reorderSiblings(siblings)).toEqual([
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
