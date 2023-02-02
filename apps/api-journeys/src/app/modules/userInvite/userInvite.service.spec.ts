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
    journeyId: 'journeyId',
    name: 'username',
    email: 'email@test.com',
    accepted: false,
    expireAt: 'UTCDateTimeString'
  }

  const userInviteWithId = keyAsId(userInvite)

  describe('getUserInviteByJourneyAndEmail', () => {
    it('should return a userInvite if exists', async () => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [userInvite])
      )
      expect(
        await service.getUserInviteByJourneyAndEmail(
          'journeyId',
          'email@test.com'
        )
      ).toEqual(userInviteWithId)
    })
  })

  describe('getAllUserInvitesByEmail', () => {
    it('should return a userInvite array', async () => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [userInvite])
      )
      expect(await service.getAllUserInvitesByEmail('email@test.com')).toEqual([
        userInviteWithId
      ])
    })
  })

  describe('getAllUserInvitesByJourney', () => {
    it('should return a userInvite array', async () => {
      ;(service.db as DeepMockProxy<Database>).query.mockReturnValue(
        mockDbQueryResult(service.db, [userInvite])
      )
      expect(await service.getAllUserInvitesByJourney('journeyId')).toEqual([
        userInviteWithId
      ])
    })
  })
})
