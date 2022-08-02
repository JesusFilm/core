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
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [user])
      )
    })
    it('should return a user', async () => {
      expect(await service.getUserRoleById('1')).toEqual(userWithId)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(mockCollectionSaveResult(service.collection, user))
    })

    it('should save a user', async () => {
      expect(await service.save(user)).toEqual(userWithId)
    })
  })
})
