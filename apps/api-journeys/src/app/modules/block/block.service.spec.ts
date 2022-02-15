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
  ThemeName
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
            { _key: block._key, parentOrder: 0 },
            { _key: block._key, parentOrder: 1 }
          ])
      )
    })

    it('should remove blocks', async () => {
      expect(
        await service.removeBlockAndChildren(
          block._key,
          block.parentBlockId,
          journey.id
        )
      ).toEqual([block, block, block])
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
  })
})
