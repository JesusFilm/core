import { Test, TestingModule } from '@nestjs/testing'
import { VideoTriggerBlock } from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { VideoTriggerResolver } from './videoTrigger.resolver'

describe('VideoTriggerBlockResolver', () => {
  let resolver: VideoTriggerResolver,
    blockResolver: BlockResolver,
    prisma: PrismaService

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'VideoTriggerBlock',
    parentBlockId: '3',
    parentOrder: 0,
    triggerStart: 5,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const blockResponse = {
    id: '1',
    journey: { connect: { id: '2' } },
    typename: 'VideoTriggerBlock',
    parentBlockId: '3',
    parentOrder: 0,
    triggerStart: 5,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const actionResponse = {
    ...blockResponse.action,
    parentBlockId: block.id
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        BlockService,
        VideoTriggerResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<VideoTriggerResolver>(VideoTriggerResolver)
    blockResolver = module.get<BlockResolver>(BlockResolver)
    prisma = module.get<PrismaService>(PrismaService)
    prisma.block.findUnique = jest.fn().mockResolvedValue(blockResponse)
    prisma.block.findMany = jest.fn().mockResolvedValue([blockResponse, blockResponse])
  })

  describe('VideoTriggerBlock', () => {
    it('returns VideoTriggerBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse)
      expect(await blockResolver.blocks()).toEqual([
        blockResponse,
        blockResponse
      ])
    })
  })

  describe('action', () => {
    it('returns VideoTriggerBlock action with parentBlockId', async () => {
      expect(
        await resolver.action(block as unknown as VideoTriggerBlock)
      ).toEqual(actionResponse)
    })
  })
})
