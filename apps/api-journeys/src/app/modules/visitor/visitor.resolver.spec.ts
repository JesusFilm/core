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

  describe('userAgent', () => {
    it('parses empty case', () => {
      expect(resolver.userAgent({})).toBeUndefined()
    })

    it('parses desktop user-agent', () => {
      expect(
        resolver.userAgent({
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
        })
      ).toMatchObject({
        browser: { major: '106', name: 'Chrome', version: '106.0.0.0' },
        device: { model: undefined, type: undefined, vendor: undefined },
        os: { name: 'Mac OS', version: '10.15.7' }
      })
    })
  })

  it('parses mobile user-agent', () => {
    expect(
      resolver.userAgent({
        userAgent:
          'Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3'
      })
    ).toMatchObject({
      browser: { major: '19', name: 'Chrome', version: '19.0.1084.60' },
      device: { model: 'iPhone', type: 'mobile', vendor: 'Apple' },
      os: { name: 'iOS', version: '5.1.1' }
    })
  })
})
