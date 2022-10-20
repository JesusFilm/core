import { Test, TestingModule } from '@nestjs/testing'
import { VisitorTeamsConnection } from '../../__generated__/graphql'

import { VisitorTeamResolver } from './visitorTeam.resolver'
import { VisitorTeamService } from './visitorTeam.service'

describe('VisitorTeamResolver', () => {
  let resolver: VisitorTeamResolver, vtService: VisitorTeamService
  const connection: VisitorTeamsConnection = {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      startCursor: null,
      endCursor: null
    }
  }

  const visitorTeamService = {
    provide: VisitorTeamService,
    useFactory: () => ({
      getList: jest.fn(() => connection)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitorTeamResolver, visitorTeamService]
    }).compile()
    resolver = module.get<VisitorTeamResolver>(VisitorTeamResolver)
    vtService = module.get<VisitorTeamService>(VisitorTeamService)
  })

  describe('visitorTeamsConnection', () => {
    it('should return connection', async () => {
      expect(await resolver.visitorTeamsConnection('jfp-team')).toEqual(
        connection
      )
    })

    it('should call service with first, after and filter', async () => {
      await resolver.visitorTeamsConnection('jfp-team', 50, 'cursorId')
      expect(vtService.getList).toHaveBeenCalledWith({
        after: 'cursorId',
        filter: { teamId: 'jfp-team' },
        first: 50
      })
    })
  })
})
