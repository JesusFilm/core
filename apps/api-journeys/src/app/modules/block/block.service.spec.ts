import { Test, TestingModule } from '@nestjs/testing'
import { BlockService } from './block.service'
import { ThemeMode, ThemeName } from '../../graphql'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockCollectionSaveResult, mockDbQueryResult } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'

describe('BlockService', () => {
  let service: BlockService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockService, {
        provide: 'DATABASE', useFactory: () => mockDeep<Database>()
      }],
    }).compile()

    service = module.get<BlockService>(BlockService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  const block = {
    _key: "1",
    journeyId: "2",
    type: 'CardBlock',
    parentBlockId: "3",
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: "4",
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
  }

  describe('getAll', () => {
    beforeEach(() => {
      (service.db as DeepMockProxy<Database>).query.mockReturnValue(mockDbQueryResult(service.db, [block, block]))
    })  

    it('should return an array of journeys', async () => {
      expect(await service.getAll()).toEqual([block, block])
    })
  })

  describe('get', () => {
    beforeEach(() => {
      (service.db as DeepMockProxy<Database>).query.mockReturnValue(mockDbQueryResult(service.db, [block]))
    })  

    it('should return a journey', async () => {
      expect(await service.get("1")).toEqual(block)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      (service.collection as DeepMockProxy<DocumentCollection>).save.mockReturnValue(mockCollectionSaveResult(service.collection, block))
    })  

    it('should return a saved journey', async () => {
      expect(await service.save(block)).toEqual(block)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      (service.collection as DeepMockProxy<DocumentCollection>).update.mockReturnValue(mockCollectionSaveResult(service.collection, block))
    })  

    it('should return a saved journey', async () => {
      expect(await service.update(block._key, block)).toEqual(block)
    })
  })
})
