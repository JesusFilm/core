import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { DocumentCollection } from 'arangojs/collection'
import { AqlQuery } from 'arangojs/aql'
import { EventService } from './event.service'

describe('VisitorService', () => {
  let service: EventService, db: DeepMockProxy<Database>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<EventService>(EventService)
    db = service.db as DeepMockProxy<Database>
    service.collection = mockDeep<DocumentCollection>()
  })
  afterAll(() => jest.resetAllMocks())

  describe('getAllByVisitorId', () => {
    const event = {
      id: 'eventId'
    }
    it('returns a list of events by visitor', async () => {
      db.query.mockImplementation(async (q) => {
        const { query, bindVars } = q as unknown as AqlQuery
        expect(query).toEqual(`
      FOR event IN undefined
        FILTER event.visitorId == @value0
        RETURN event
    `)
        expect(bindVars).toEqual({
          value0: 'visitorId'
        })
        return await mockDbQueryResult(service.db, [event])
      })
      expect(await service.getAllByVisitorId('visitorId')).toEqual([event])
    })
  })
})
