import { Test, TestingModule } from '@nestjs/testing'
import { VisitorsConnection } from '../../__generated__/graphql'

import { VisitorResolver } from './visitor.resolver'
import { VisitorService } from './visitor.service'

describe('VisitorResolver', () => {
  let resolver: VisitorResolver, vtService: VisitorService
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitorResolver, visitorService]
    }).compile()
    resolver = module.get<VisitorResolver>(VisitorResolver)
    vtService = module.get<VisitorService>(VisitorService)
  })

  describe('visitorsConnection', () => {
    it('should return connection', async () => {
      expect(await resolver.visitorsConnection('jfp-team')).toEqual(connection)
    })

    it('should call service with first, after and filter', async () => {
      await resolver.visitorsConnection('jfp-team', 50, 'cursorId')
      expect(vtService.getList).toHaveBeenCalledWith({
        after: 'cursorId',
        filter: { teamId: 'jfp-team' },
        first: 50
      })
    })
  })
})
