import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyService } from './userJourney.service'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockCollectionRemoveResult, mockCollectionSaveResult, mockDbQueryResult } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { UserJourneyRoles } from '../../graphql'

describe('UserJourneyService', () => {
  let service: UserJourneyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserJourneyService, {
        provide: 'DATABASE', useFactory: () => mockDeep<Database>()
      }],
    }).compile()

    service = module.get<UserJourneyService>(UserJourneyService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  const userJourney = {
    _key: "1",
    userId: "1",  
    journeyId: "2",
    role: UserJourneyRoles.editor
  }

  const user = {
    id: "1",
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  describe('forUser', () => {
    beforeEach(() => {
      (service.db as DeepMockProxy<Database>).query.mockReturnValue(mockDbQueryResult(service.db, [userJourney, userJourney]))
    })  

    it('should return an array of users', async () => {
      expect(await service.forUser(user)).toEqual([userJourney, userJourney])
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      (service.collection as DeepMockProxy<DocumentCollection>).remove.mockReturnValue(mockCollectionRemoveResult(service.collection, userJourney))
    })  

    it('should return a removed userJourney', async () => {
      expect(await service.remove("1")).toEqual(userJourney)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      (service.collection as DeepMockProxy<DocumentCollection>).save.mockReturnValue(mockCollectionSaveResult(service.collection, userJourney))
    })  

    it('should return a saved userJourney', async () => {
      expect(await service.save(userJourney)).toEqual(userJourney)
    })
  })

  describe('update', () => {
    beforeEach(() => {
      (service.collection as DeepMockProxy<DocumentCollection>).update.mockReturnValue(mockCollectionSaveResult(service.collection, userJourney))
    })  

    it('should return an updated userJourney', async () => {
      expect(await service.update("1", userJourney)).toEqual(userJourney)
    })
  })

})

