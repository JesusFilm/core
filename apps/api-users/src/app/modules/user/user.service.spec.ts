import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  mockCollectionSaveResult,
  mockDbQueryResult
} from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators'

import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const user = {
    _key: '1',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  const userWithId = keyAsId(user)

  describe('getAll', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [user, user])
      )
    })

    it('should return an array of users', async () => {
      expect(await service.getAll()).toEqual([userWithId, userWithId])
    })
  })

  describe('get', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [user])
      )
    })

    it('should return a user', async () => {
      expect(await service.get('1')).toEqual(userWithId)
    })
  })

  describe('getByUserId', () => {
    beforeEach(() => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [user])
      )
    })

    it('should return a user', async () => {
      expect(await service.getByUserId('1')).toEqual(userWithId)
    })
  })

  describe('save', () => {
    beforeEach(() => {
      ;(
        service.collection as DeepMockProxy<DocumentCollection>
      ).save.mockReturnValue(mockCollectionSaveResult(service.collection, user))
    })

    it('should return a saved user', async () => {
      expect(await service.save(user)).toEqual(userWithId)
    })
  })
})
