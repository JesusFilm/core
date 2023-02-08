import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'

import { AqlQuery } from 'arangojs/aql'
import { MemberService } from './member.service'

describe('memberService', () => {
  let service: MemberService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<MemberService>(MemberService)
    collectionMock = mockDeep()
    service.collection = collectionMock
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const member = {
    _key: 'memberId',
    userId: 'userId',
    teamId: 'teamId'
  }

  const memberWithId = keyAsId(member)

  describe('getMemberByTeamId', () => {
    it('should return a member', async () => {
      db.query.mockImplementation(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(`
      FOR member in members
        FILTER member.userId == @value0 AND member.teamId == @value1
        LIMIT 1
        RETURN member
    `)
        expect(bindVars).toEqual({
          value0: 'userId',
          value1: 'teamId'
        })
        return await mockDbQueryResult(service.db, [member])
      })
      expect(await service.getMemberByTeamId('userId', 'teamId')).toEqual(
        memberWithId
      )
    })

    it('should return undefined', async () => {
      db.query.mockReturnValue(mockDbQueryResult(service.db, []))
      expect(
        await service.getMemberByTeamId('userId', 'teamId')
      ).toBeUndefined()
    })
  })
})
