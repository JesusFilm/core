import { Test, TestingModule } from '@nestjs/testing'
import { JourneyService } from './journey.service'
import { ThemeMode, ThemeName } from '../../graphql'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockCollectionSaveResult, mockDbQueryResult } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'

describe('JourneyService', () => {
  let service: JourneyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyService, {
        provide: 'DATABASE', useFactory: () => mockDeep<Database>()
      }],
    }).compile()

    service = module.get<JourneyService>(JourneyService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  const journey = {
    _key: "1",
    title: 'published',
    published: true,
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug'
  }

  describe('getAll', () => {
    beforeEach(() => {
      (service.db as DeepMockProxy<Database>).query.mockReturnValue(mockDbQueryResult(service.db, [journey, journey]))
    })  

    it('should return an array of journeys', async () => {
      expect(await service.getAll()).toEqual([journey, journey])
    })
  })

  describe('get', () => {
    beforeEach(() => {
      (service.db as DeepMockProxy<Database>).query.mockReturnValue(mockDbQueryResult(service.db, [journey]))
    })  

    it('should return a journey', async () => {
      expect(await service.get("1")).toEqual(journey)
    })
  })

  describe('getBySlug', () => {
    beforeEach(() => {
      (service.db as DeepMockProxy<Database>).query.mockReturnValue(mockDbQueryResult(service.db, [journey]))
    })  

    it('should return a journey', async () => {
      expect(await service.getBySlug("slug")).toEqual(journey)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      (service.collection as DeepMockProxy<DocumentCollection>).save.mockReturnValue(mockCollectionSaveResult(service.collection, journey))
    })  

    it('should return a saved journey', async () => {
      expect(await service.save(journey)).toEqual(journey)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      (service.collection as DeepMockProxy<DocumentCollection>).update.mockReturnValue(mockCollectionSaveResult(service.collection, journey))
    })  

    it('should return a saved journey', async () => {
      expect(await service.update(journey._key, journey)).toEqual(journey)
    })
  })
})
