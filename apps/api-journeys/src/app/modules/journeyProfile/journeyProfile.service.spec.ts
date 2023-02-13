import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { JourneyProfileService } from './journeyProfile.service'

describe('journeyProfileService', () => {
  let service: JourneyProfileService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyProfileService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<JourneyProfileService>(JourneyProfileService)
    collectionMock = mockDeep()
    service.collection = collectionMock
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

    it('should return null if user role does not exist', async () => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [])
      )

      expect(await service.getJourneyProfileByUserId('2')).toEqual(null)
    })
  })
})
