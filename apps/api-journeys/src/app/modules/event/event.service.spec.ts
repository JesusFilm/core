import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { DocumentCollection } from 'arangojs/collection'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'
import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService, db: DeepMockProxy<Database>

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn((blockId) => {
        switch (blockId) {
          case block._key:
            return block
        }
      }),
      validateBlock: jest.fn((stepId) => {
        switch (stepId) {
          case step._key:
            return true
          default:
            return false
        }
      })
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getByUserIdAndJourneyId: jest.fn((userId) => {
        switch (userId) {
          case visitor.userId:
            return visitor
        }
      })
    })
  }

  const block = {
    _key: 'block.id',
    journeyId: 'journey.id'
  }

  const step = {
    _key: 'step.id',
    journeyId: 'journey.id'
  }

  const visitor = {
    id: 'visitor.id',
    userId: 'user.id'
  }

  beforeEach(async () => {
    db = mockDeep<Database>()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        blockService,
        visitorService,
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
    jest.resetAllMocks()
  })

  describe('ValidateBlockEvent', () => {
    it('should return the visitor id and journey id', async () => {
      expect(
        await service.validateBlockEvent('user.id', 'block.id', 'step.id')
      ).toEqual({
        visitorId: 'visitor.id',
        journeyId: 'journey.id'
      })
    })

    it('should throw user input error if block doesnt exist', async () => {
      await expect(
        async () =>
          await service.validateBlockEvent(
            'user.id',
            'anotherBlock.id',
            'step.id'
          )
      ).rejects.toThrow('Block does not exist')
    })

    it('should throw user input error if step block does not belong to the same journey as the block', async () => {
      await expect(
        async () =>
          await service.validateBlockEvent(
            'user.id',
            'block.id',
            'anotherStep.id'
          )
      ).rejects.toThrow(
        'Step ID anotherStep.id does not exist on Journey with ID journey.id'
      )
    })
  })
})
