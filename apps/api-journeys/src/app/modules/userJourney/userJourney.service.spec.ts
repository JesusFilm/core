import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionRemoveResult,
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../__generated__/graphql'
import { UserJourneyService } from './userJourney.service'

describe('UserJourneyService', () => {
  let service: UserJourneyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<UserJourneyService>(UserJourneyService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const userJourney = {
    _key: '1',
    userId: '1',
    journeyId: '2',
    role: UserJourneyRole.editor
  }

  const journey = {
    id: '1',
    title: 'published',
    locale: 'en-US',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug',
    createdAt: '',
    status: JourneyStatus.published
  }

  describe('forJourney', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [userJourney, userJourney])
      )
    })

    it('should return an array of userjourneys', async () => {
      expect(await service.forJourney(journey)).toEqual([
        userJourney,
        userJourney
      ])
    })
  })

  describe('forUserJourney', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [userJourney])
      )
    })

    it('should return a userjourney', async () => {
      expect(await service.forJourneyUser('1', 2)).toEqual(userJourney)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).remove.mockReturnValue(
        mockCollectionRemoveResult(service.collection, userJourney)
      )
    })

    it('should return a removed userJourney', async () => {
      expect(await service.remove('1')).toEqual(userJourney)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(
        mockCollectionSaveResult(service.collection, userJourney)
      )
    })

    it('should return a saved userJourney', async () => {
      expect(await service.save(userJourney)).toEqual(userJourney)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).update.mockReturnValue(
        mockCollectionSaveResult(service.collection, userJourney)
      )
    })

    it('should return an updated userJourney', async () => {
      expect(await service.update('1', userJourney)).toEqual(userJourney)
    })
  })
})
