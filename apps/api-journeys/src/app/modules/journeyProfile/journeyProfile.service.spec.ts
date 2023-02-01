import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database/mock'
import { DocumentCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { JourneyProfileService } from './journeyProfile.service'

describe('journeyProfileService', () => {
  let service: JourneyProfileService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyProfileService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<JourneyProfileService>(JourneyProfileService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const user = {
    _key: '1',
    userId: 'userId',
    acceptedTermsAt: '2021-11-19T12:34:56.647Z'
  }

  const userWithId = keyAsId(user)

  describe('getJourneyProfileByUserId', () => {
    it('should return a user role if exists', async () => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [user])
      )
      expect(await service.getJourneyProfileByUserId('1')).toEqual(userWithId)
    })

    it('should return a newly created user role', async () => {
      const user2 = {
        _key: '2',
        userId: 'userId2',
        acceptedTermsAt: null
      }

      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [])
      )
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(
        mockCollectionSaveResult(service.collection, user2)
      )

      expect(await service.getJourneyProfileByUserId('2')).toEqual(
        keyAsId(user2)
      )
    })
  })
})
