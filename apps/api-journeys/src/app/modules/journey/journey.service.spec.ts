import { Test, TestingModule } from '@nestjs/testing'
import { Database, aql } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database/mock'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { AqlQuery } from 'arangojs/aql'
import {
  JourneysFilter,
  JourneyStatus,
  Role,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { JourneyService } from './journey.service'

describe('JourneyService', () => {
  let service: JourneyService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeEach(async () => {
    db = mockDeep()
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
    collectionMock = mockDeep()
    service.collection = collectionMock
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

  const userRole = {
    id: 'userRole.id',
    userId: 'user.id',
    roles: [Role.publisher]
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

  describe('journeyFilter', () => {
    it('should return template query', async () => {
      const filter: JourneysFilter = { template: true }
      const response = await service.journeyFilter(filter)
      expect(response.query).toEqual(aql`AND journey.template == true`.query)
    })
    it('should return featured query', async () => {
      const filter: JourneysFilter = { featured: true }
      const response = await service.journeyFilter(filter)
      expect(response.query).toEqual(
        aql`AND journey.template != true AND journey.featuredAt != null`.query
      )
    })
    it('should return not featured query', async () => {
      const filter: JourneysFilter = { featured: false }
      const response = await service.journeyFilter(filter)
      expect(response.query).toEqual(
        aql`AND journey.template != true AND journey.featuredAt == null`.query
      )
    })
    it('should return published query', async () => {
      const filter: JourneysFilter = {}
      const response = await service.journeyFilter(filter)
      expect(response.query).toEqual(aql`AND journey.template != true`.query)
    })
  })

  describe('getAllPublishedJourneys', () => {
    it('should return published journeys', async () => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey]))
      expect(await service.getAllPublishedJourneys()).toEqual([journeyWithId])
    })

    it('should filter by filter query', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(
          aql`FOR journey IN undefined
          FILTER journey.status == @value0
          AND journey.template != true AND journey.featuredAt != null
          RETURN journey
      `.query
        )
        expect(bindVars).toEqual({
          value0: 'published'
        })
        return await mockDbQueryResult(db, [journey])
      })
      await service.getAllPublishedJourneys({ featured: true })
      expect(db.query).toHaveBeenCalled()
    })
  })

  describe('getAllByTitle', () => {
    beforeEach(() => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey]))
    })

    it('should return all for title', async () => {
      expect(await service.getAllByTitle('publish', 'userId')).toEqual([
        journeyWithId
      ])
    })
  })

  describe('getAllByRole', () => {
    beforeEach(() => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey]))
    })

    it('should return all for user', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(
          aql`FOR userJourney in userJourneys
          FOR journey in undefined
            FILTER userJourney.journeyId == journey._key && userJourney.userId == @value0
              && (userJourney.role == @value1 || userJourney.role == @value2)
          && journey.status IN @value3
            RETURN journey
      `.query
        )
        expect(bindVars).toEqual({
          value0: 'user.id',
          value1: 'owner',
          value2: 'editor',
          value3: ['published']
        })
        return await mockDbQueryResult(db, [journey])
      })
      await service.getAllPublishedJourneys({ featured: true })
      expect(db.query).toHaveBeenCalled()
      expect(
        await service.getAllByRole(userRole, [JourneyStatus.published])
      ).toEqual([journeyWithId])
    })

    it('should return templates for publishers', async () => {
      db.query.mockImplementationOnce(async (q) => {
        const { query } = q as unknown as AqlQuery
        expect(query).toEqual(
          aql`FOR journey in undefined
              FILTER journey.template == true
          && true
            RETURN journey
      `.query
        )
        return await mockDbQueryResult(db, [journey])
      })
      await service.getAllPublishedJourneys({ featured: true })
      expect(db.query).toHaveBeenCalled()
      expect(await service.getAllByRole(userRole, undefined, true)).toEqual([
        journeyWithId
      ])
    })
  })

  describe('save', () => {
    beforeEach(() => {
      collectionMock.save.mockReturnValue(
        mockCollectionSaveResult(service.collection, journey)
      )
    })

    it('should return a saved journey', async () => {
      expect(await service.save(journey)).toEqual(journeyWithId)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      collectionMock.update.mockReturnValue(
        mockCollectionSaveResult(service.collection, journey)
      )
    })

    it('should return a saved journey', async () => {
      expect(await service.update(journey._key, journey)).toEqual(journeyWithId)
    })
  })
})
