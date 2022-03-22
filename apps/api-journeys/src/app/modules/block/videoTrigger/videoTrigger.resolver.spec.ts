import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { VideoTriggerBlock } from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { VideoTriggerResolver } from './videoTrigger.resolver'

describe('VideoTriggerBlockResolver', () => {
  let resolver: VideoTriggerResolver, blockResolver: BlockResolver

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

  const actionResponse = {
    ...blockResponse.action,
    parentBlockId: block.id
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block])
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        VideoTriggerResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<VideoTriggerResolver>(VideoTriggerResolver)
    blockResolver = module.get<BlockResolver>(BlockResolver)
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
