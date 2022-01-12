import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
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

    it('should return an array of journeys', async () => {
      expect(await service.getAll()).toEqual([block, block])
    })
  })

  describe('forJourney', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block, block])
      )
    })

    it('should return an array of journeys', async () => {
      expect(await service.forJourney(journey)).toEqual([block, block])
    })
  })

  describe('get', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [block])
      )
    })

    it('should return a journey', async () => {
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

    it('should return a saved journey', async () => {
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

    it('should return a saved journey', async () => {
      expect(await service.update(block._key, block)).toEqual(block)
    })
  })
})
