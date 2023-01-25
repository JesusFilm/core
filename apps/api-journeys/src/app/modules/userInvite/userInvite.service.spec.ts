import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { DocumentCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { UserInviteService } from './userInvite.service'

describe('userInviteService', () => {
  let service: UserInviteService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserInviteService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<UserInviteService>(UserInviteService)
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const userInvite = {
    _key: '1',
    inviteId: 'inviteId',
    journeyId: 'journeyId',
    sentBy: 'senderId',
    name: 'username',
    email: 'email@test.com',
    acceptedBy: null,
    expireAt: 'UTCDateTimeString'
  }

  const userInviteWithId = keyAsId(userInvite)

  describe('getUserInviteByInviteId', () => {
    it('should return a userInvite if exists', async () => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [userInvite])
      )
      expect(await service.getUserInviteByInviteId('inviteId')).toEqual(
        userInviteWithId
      )
    })
  })

  describe('getAllUserInvitesBySender', () => {
    it('should return a userInvite array', async () => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [userInvite])
      )
      expect(await service.getAllUserInvitesBySender('senderId')).toEqual([
        userInviteWithId
      ])
    })
  })
})
