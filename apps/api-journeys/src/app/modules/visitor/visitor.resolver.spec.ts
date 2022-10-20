import { Test, TestingModule } from '@nestjs/testing'
import { VisitorsConnection } from '../../__generated__/graphql'
import { MemberService } from '../member/member.service'

import { VisitorResolver } from './visitor.resolver'
import { VisitorService } from './visitor.service'

describe('VisitorResolver', () => {
  let resolver: VisitorResolver,
    vService: VisitorService,
    mService: MemberService

  const connection: VisitorsConnection = {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      startCursor: null,
      endCursor: null
    }
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getList: jest.fn(() => connection)
    })
  }

  const member = {
    id: 'memberId',
    userId: 'userId',
    teamId: 'teamId'
  }

  const memberService = {
    provide: MemberService,
    useFactory: () => ({
      getMemberByTeamId: jest.fn(() => member)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitorResolver, visitorService, memberService]
    }).compile()
    resolver = module.get<VisitorResolver>(VisitorResolver)
    vService = module.get<VisitorService>(VisitorService)
    mService = module.get<MemberService>(MemberService)
  })

  describe('visitorsConnection', () => {
    it('returns connection', async () => {
      expect(await resolver.visitorsConnection('userId', 'teamId')).toEqual(
        connection
      )
    })

    it('calls service with first, after and filter', async () => {
      await resolver.visitorsConnection('userId', 'teamId', 50, 'cursorId')
      expect(vService.getList).toHaveBeenCalledWith({
        after: 'cursorId',
        filter: { teamId: 'teamId' },
        first: 50
      })
    })

    it('throws error when user is not a team member', async () => {
      ;(
        mService.getMemberByTeamId as jest.MockedFunction<
          typeof mService.getMemberByTeamId
        >
      ).mockResolvedValue(undefined)
      await expect(
        async () => await resolver.visitorsConnection('userId', 'teamId')
      ).rejects.toThrow('User is not a member of the team.')
    })
  })
})
