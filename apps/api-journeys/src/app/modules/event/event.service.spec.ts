import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService, prismaService: PrismaService

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      validateBlock: jest.fn((stepId) => {
        switch (stepId) {
          case step.id:
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
            return { visitor, journeyVisitor }
          default:
            return null
        }
      })
    })
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id'
  }

  const step = {
    id: 'step.id',
    journeyId: 'journey.id'
  }

  const visitor = {
    id: 'visitor.id',
    userId: 'user.id'
  }

  const journeyVisitor = {
    journeyId: 'journey.id',
    visitorId: 'visitor.id'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventService, blockService, visitorService, PrismaService]
    }).compile()

    service = module.get<EventService>(EventService)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockImplementation((input) => {
      switch (input.where.id) {
        case block.id:
          return block
        default:
          return null
      }
    })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('ValidateBlockEvent', () => {
    it('should return the visitor id and journey id', async () => {
      expect(
        await service.validateBlockEvent('user.id', 'block.id', 'step.id')
      ).toEqual({
        visitor,
        journeyVisitor,
        journeyId: 'journey.id'
      })
    })

    it('should throw user input error if block does not exist', async () => {
      await expect(
        async () =>
          await service.validateBlockEvent(
            'user.id',
            'anotherBlock.id',
            step.id
          )
      ).rejects.toThrow('Block does not exist')
    })

    it('should throw user input error if visitor does not exist', async () => {
      await expect(
        async () =>
          await service.validateBlockEvent('anotherUser.id', block.id, step.id)
      ).rejects.toThrow('Visitor does not exist')
    })

    it('should throw user input error if step block does not belong to the same journey as the block', async () => {
      await expect(
        async () =>
          await service.validateBlockEvent(
            'user.id',
            block.id,
            'anotherStep.id'
          )
      ).rejects.toThrow(
        'Step ID anotherStep.id does not exist on Journey with ID journey.id'
      )
    })
  })
})
