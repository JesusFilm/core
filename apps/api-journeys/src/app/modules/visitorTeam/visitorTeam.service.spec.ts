import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { DocumentCollection } from 'arangojs/collection'
import { AqlQuery } from 'arangojs/aql'
import { VisitorTeamService } from './visitorTeam.service'

describe('VisitorTeamService', () => {
  let service: VisitorTeamService, db: DeepMockProxy<Database>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorTeamService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<VisitorTeamService>(VisitorTeamService)
    db = service.db as DeepMockProxy<Database>
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => jest.resetAllMocks())

  describe('getList', () => {
    const connection = {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        startCursor: null,
        endCursor: null
      }
    }
    it('returns a visitor teams connection', async () => {
      db.query.mockImplementation(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(`
    LET $edges_plus_one = (
      FOR item IN visitorTeams
        FILTER item.@value0 == @value1
        SORT item.createdAt @value2
        LIMIT @value3 + 1
        RETURN { cursor: item._key, node: MERGE({ id: item._key }, item) }
    )
    LET $edges = SLICE($edges_plus_one, 0, @value3)
    RETURN {
      edges: $edges,
      pageInfo: {
        hasNextPage: LENGTH($edges_plus_one) == @value3 + 1,
        startCursor: LENGTH($edges) > 0 ? FIRST($edges).cursor : null,
        endCursor: LENGTH($edges) > 0 ? LAST($edges).cursor : null
      }
    }
    `)
        expect(bindVars).toEqual({
          value0: 'teamId',
          value1: 'jfp-team',
          value2: 'ASC',
          value3: 50
        })
        return await mockDbQueryResult(service.db, [connection])
      })
      expect(
        await service.getList({ first: 50, filter: { teamId: 'jfp-team' } })
      ).toEqual(connection)
    })

    it('allows pagination of the visitor teams connection', async () => {
      db.query.mockImplementation(async (q) => {
        const { bindVars } = q as unknown as AqlQuery
        expect(bindVars).toEqual({
          value0: 'cursorId',
          value1: 'teamId',
          value2: 'jfp-team',
          value3: 'ASC',
          value4: 50
        })
        return await mockDbQueryResult(service.db, [connection])
      })
      await service.getList({
        first: 50,
        after: 'cursorId',
        filter: { teamId: 'jfp-team' }
      })
    })

    it('allows custom sort order of the visitor teams connection', async () => {
      db.query.mockImplementation(async (q) => {
        const { bindVars } = q as unknown as AqlQuery
        expect(bindVars).toEqual({
          value0: 'teamId',
          value1: 'jfp-team',
          value2: 'DESC',
          value3: 50
        })
        return await mockDbQueryResult(service.db, [connection])
      })
      await service.getList({
        first: 50,
        filter: { teamId: 'jfp-team' },
        sortOrder: 'DESC'
      })
    })
  })
})
