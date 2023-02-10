import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database/mock'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { Role } from '../../__generated__/graphql'
import { UserRoleService } from './userRole.service'

describe('userRoleService', () => {
  let service: UserRoleService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<UserRoleService>(UserRoleService)
    collectionMock = mockDeep()
    service.collection = collectionMock
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const user = {
    _key: '1',
    userId: 'userId',
    roles: [Role.publisher]
  }

  const userWithId = keyAsId(user)

  describe('getUserRoleById', () => {
    it('should return a user role if exists', async () => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, [user]))
      expect(await service.getUserRoleById('1')).toEqual(userWithId)
    })

    it('should return a newly created user role', async () => {
      const user2 = {
        _key: '2',
        userId: 'userId2',
        roles: []
      }

      db.query.mockReturnValue(mockDbQueryResult(service.db, []))
      collectionMock.save.mockReturnValue(
        mockCollectionSaveResult(service.collection, user2)
      )

      expect(await service.getUserRoleById('2')).toEqual(keyAsId(user2))
    })
  })
})
