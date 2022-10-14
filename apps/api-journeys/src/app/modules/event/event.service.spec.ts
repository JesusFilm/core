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

  const block = {
    _key: '1',
    journeyId: 'journey.id',
    __typename: 'CardBlock',
    parentBlockId: '3',
    parentOrder: 0,
    backgroundColor: '#FFF',
    coverBlockId: '4',
    fullscreen: true
  }

  const blockWithId = keyAsId(block)

  describe('getBlockById', () => {
    beforeEach(() => {
      db.query.mockReturnValueOnce(mockDbQueryResult(db, [block]))
    })
    it('should return block', async () => {
      expect(await service.getBlockById('1')).toEqual(blockWithId)
    })
  })
})
