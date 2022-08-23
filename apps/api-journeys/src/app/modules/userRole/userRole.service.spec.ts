import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database/mock'
import { DocumentCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { Role } from '../../__generated__/graphql'
import { UserRoleService } from './userRole.service'

describe('userRoleService', () => {
  let service: UserRoleService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<UserRoleService>(UserRoleService)
    service.collection = mockDeep<DocumentCollection>()
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
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [user])
      )
      expect(await service.getUserRoleById('1')).toEqual(userWithId)
    })

    it('should return a newly created user role', async () => {
      const user2 = {
        _key: '2',
        userId: 'userId2',
        roles: []
      }

      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [])
      )
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(
        mockCollectionSaveResult(service.collection, user2)
      )

      expect(await service.getUserRoleById('2')).toEqual(keyAsId(user2))
    })
  })
})
