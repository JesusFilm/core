import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockDbQueryResult } from '@core/nest/database/mock'
import { DocumentCollection } from 'arangojs/collection'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService, db: DeepMockProxy<Database>

  beforeEach(async () => {
    db = mockDeep<Database>()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<EventService>(EventService)
    service.collection = mockDeep<DocumentCollection>()
  })

  afterAll(() => {
    jest.restoreAllMocks()
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
        await service.getVisitorByUserIdAndJourneyId('user.id', 'team.id')
      ).toEqual(visitorWithId)
    })
  })
})
