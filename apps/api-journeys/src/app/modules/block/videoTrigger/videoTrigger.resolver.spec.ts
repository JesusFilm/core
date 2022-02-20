import { Test, TestingModule } from '@nestjs/testing'
import { VideoTriggerBlock } from '../../../__generated__/graphql'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { VideoTriggerResolver } from './videoTrigger.resolver'

describe('VideoTriggerBlockResolver', () => {
  let resolver: VideoTriggerResolver, blockResolver: BlockResolver

  const block = {
    _key: '1',
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

  const blockWithId = {
    ...block,
    id: block._key,
    _key: undefined
  }

  const blockResponse = {
    id: '1',
    journeyId: '2',
    __typename: 'VideoTriggerBlock',
    parentBlockId: '3',
    parentOrder: 0,
    triggerStart: 5,
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      journeyId: '4'
    }
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => blockResponse),
      getAll: jest.fn(() => [blockResponse, blockResponse])
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockResolver, blockService, VideoTriggerResolver]
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

    it('returns VideoTriggerBlock action with parentBlockId', async () => {
      expect(
        await resolver.action(blockWithId as unknown as VideoTriggerBlock)
      ).toEqual(blockResponse.action)
    })
  })
})
