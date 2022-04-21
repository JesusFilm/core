import { Test, TestingModule } from '@nestjs/testing'
import { Database, aql } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators'
import { AqlQuery } from 'arangojs/aql'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { JourneyService } from './journey.service'

describe('JourneyService', () => {
  let service: JourneyService, db: DeepMockProxy<Database>

  beforeEach(async () => {
    db = mockDeep<Database>()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<JourneyService>(JourneyService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const journey = {
    _key: '1',
    title: 'published',
    status: JourneyStatus.published,
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug'
  }

  const journeyWithId = keyAsId(journey)

  describe('getAll', () => {
    beforeEach(() => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey, journey]))
    })

    it('should return an array of journeys', async () => {
      expect(await service.getAll()).toEqual([journeyWithId, journeyWithId])
    })
  })

  describe('get', () => {
    beforeEach(() => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey]))
    })

    it('should return a journey', async () => {
      expect(await service.get('1')).toEqual(journeyWithId)
    })
  })

  describe('getBySlug', () => {
    beforeEach(() => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey]))
    })

    it('should return a journey', async () => {
      expect(await service.getBySlug('slug')).toEqual(journeyWithId)
    })
  })

  describe('getAllPublishedJourneys', () => {
    it('should return published journeys', async () => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey]))
      expect(await service.getAllPublishedJourneys()).toEqual([journeyWithId])
    })

    it('should filter by featured', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(
          aql`
          FOR journey IN undefined
            FILTER journey.status == @value0
              AND journey.featuredAt != null
            RETURN journey
        `.query
        )
        expect(bindVars).toEqual({
          value0: 'published'
        })
        return await mockDbQueryResult(db, [journey])
      })
      await service.getAllPublishedJourneys({ featured: true })
    })

    it('should filter by not featured', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(
          aql`
          FOR journey IN undefined
            FILTER journey.status == @value0
              AND journey.featuredAt == null
            RETURN journey
        `.query
        )
        expect(bindVars).toEqual({
          value0: 'published'
        })
        return await mockDbQueryResult(db, [journey])
      })
      await service.getAllPublishedJourneys({ featured: false })
    })
  })

  describe('getAllByOwnerEditor', () => {
    beforeEach(() => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey]))
    })

    it('should return all for user', async () => {
      expect(await service.getAllByOwnerEditor('1')).toEqual([journeyWithId])
    })
  })

  describe('save', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(
        mockCollectionSaveResult(service.collection, journey)
      )
    })

    it('should return a saved journey', async () => {
      expect(await service.save(journey)).toEqual(journeyWithId)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).update.mockReturnValue(
        mockCollectionSaveResult(service.collection, journey)
      )
    })

    it('should return a saved journey', async () => {
      expect(await service.update(journey._key, journey)).toEqual(journeyWithId)
    })
  })
})
