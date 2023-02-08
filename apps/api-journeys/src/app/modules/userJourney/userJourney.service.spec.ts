import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionRemoveResult,
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database/mock'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import {
  Journey,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../__generated__/graphql'
import { UserJourneyRecord, UserJourneyService } from './userJourney.service'

describe('UserJourneyService', () => {
  let service: UserJourneyService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<UserJourneyService>(UserJourneyService)
    collectionMock = mockDeep()
    service.collection = collectionMock
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const userJourney: UserJourneyRecord = {
    id: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.editor
  }

  const userJourneyWithId = keyAsId(userJourney)

  const journey: Journey = {
    id: '1',
    title: 'published',
    language: { id: '529' },
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlock: null,
    slug: 'published-slug',
    createdAt: '',
    status: JourneyStatus.published
  }

  describe('forJourney', () => {
    beforeEach(() => {
      db.query.mockReturnValue(
        mockDbQueryResult(service.db, [userJourney, userJourney])
      )
    })

    it('should return an array of userjourneys', async () => {
      expect(await service.forJourney(journey)).toEqual([
        userJourneyWithId,
        userJourneyWithId
      ])
    })
  })

  describe('forUserJourney', () => {
    beforeEach(() => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [userJourney]))
    })

    it('should return a userjourney', async () => {
      expect(await service.forJourneyUser('1', '2')).toEqual(userJourneyWithId)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      collectionMock.remove.mockReturnValue(
        mockCollectionRemoveResult(service.collection, {
          ...userJourney,
          _key: userJourney.id
        })
      )
    })

    it('should return a removed userJourney', async () => {
      expect(await service.remove('1')).toEqual(userJourneyWithId)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      collectionMock.save.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...userJourney,
          _key: userJourney.id
        })
      )
    })

    it('should return a saved userJourney', async () => {
      expect(await service.save(userJourney)).toEqual(userJourneyWithId)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      collectionMock.update.mockReturnValue(
        mockCollectionSaveResult(service.collection, {
          ...userJourney,
          _key: userJourney.id
        })
      )
    })

    it('should return an updated userJourney', async () => {
      expect(await service.update('1', userJourney)).toEqual(userJourneyWithId)
    })
  })
})
