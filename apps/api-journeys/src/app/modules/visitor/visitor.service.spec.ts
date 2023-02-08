import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { v4 as uuidv4 } from 'uuid'
import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
import { AqlQuery } from 'arangojs/aql'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { VisitorService } from './visitor.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('VisitorService', () => {
  let service: VisitorService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<VisitorService>(VisitorService)
    collectionMock = mockDeep()
    service.collection = collectionMock
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  describe('getList', () => {
    const connection = {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        startCursor: null,
        endCursor: null
      }
    }
    it('returns a visitors connection', async () => {
      db.query.mockImplementation(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(`
    LET $edges_plus_one = (
      FOR item IN visitors
        FILTER item.@value0 == @value1
        SORT item.createdAt DESC
        LIMIT @value2 + 1
        RETURN { cursor: item.createdAt, node: MERGE({ id: item._key }, item) }
    )
    LET $edges = SLICE($edges_plus_one, 0, @value2)
    RETURN {
      edges: $edges,
      pageInfo: {
        hasNextPage: LENGTH($edges_plus_one) == @value2 + 1,
        startCursor: LENGTH($edges) > 0 ? FIRST($edges).cursor : null,
        endCursor: LENGTH($edges) > 0 ? LAST($edges).cursor : null
      }
    }
    `)
        expect(bindVars).toEqual({
          value0: 'teamId',
          value1: 'jfp-team',
          value2: 50
        })
        return await mockDbQueryResult(service.db, [connection])
      })
      expect(
        await service.getList({ first: 50, filter: { teamId: 'jfp-team' } })
      ).toEqual(connection)
    })

    it('allows pagination of the visitors connection', async () => {
      db.query.mockImplementation(async (q) => {
        const { bindVars } = q as unknown as AqlQuery
        expect(bindVars).toEqual({
          value0: 'cursorId',
          value1: 'teamId',
          value2: 'jfp-team',
          value3: 50
        })
        return await mockDbQueryResult(service.db, [connection])
      })
      await service.getList({
        first: 50,
        after: 'cursorId',
        filter: { teamId: 'jfp-team' }
      })
    })
  })

  describe('getVisitorId', () => {
    it('should return visitor id', async () => {
      const visitor = {
        _key: 'visitor.id',
        userId: 'user.id',
        teamId: 'team.id'
      }

      const visitorWithId = keyAsId(visitor)

      db.query.mockReturnValueOnce(mockDbQueryResult(db, [visitorWithId]))
      expect(
        await service.getByUserIdAndJourneyId('user.id', 'team.id')
      ).toEqual(visitorWithId)
    })

    it('should create a new visitor if visitor does not exist', async () => {
      const visitor = {
        _key: 'visitor.id',
        userId: 'user.id',
        teamId: 'team.id'
      }

      const visitorWithId = keyAsId(visitor)

      const journey = {
        teamId: 'team.id'
      }

      db.query.mockReturnValueOnce(mockDbQueryResult(db, [])) // mock failing to find existing visitor
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [journey]))

      mockUuidv4.mockReturnValueOnce('newVisitor.id')

      await service.getByUserIdAndJourneyId('user.id', 'team.id')
      expect(service.collection.save).toHaveBeenCalledWith({
        ...visitorWithId,
        id: 'newVisitor.id',
        createdAt: new Date().toISOString()
      })
    })
  })
})
