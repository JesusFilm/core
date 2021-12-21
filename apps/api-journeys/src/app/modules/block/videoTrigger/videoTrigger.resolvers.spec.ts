import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('VideoTriggerBlock', () => {
  let resolver: BlockResolvers

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'VideoTriggerBlock',
    parentBlockId: '3',
    parentOrder: 0,
    extraAttrs: {
      triggerStart: 5,
      action: {
        gtmEventName: 'gtmEventName',
        journeyId: '4'
      }
    }
  }

  const blockresponse = {
    id: '1',
    journeyId: '2',
    __typename: 'VideoTriggerBlock',
    parentBlockId: '3',
    parentOrder: 0,
    extraAttrs: {
      triggerStart: 5,
      action: {
        gtmEventName: 'gtmEventName',
        journeyId: '4'
      }
    }
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
      providers: [BlockResolvers, blockService]
    }).compile()
    resolver = module.get<BlockResolvers>(BlockResolvers)
  })

  describe('VideoTriggerBlock', () => {
    it('returns VideoTriggerBlock', async () => {
      expect(await resolver.block('1')).toEqual(blockresponse)
      expect(await resolver.blocks()).toEqual([blockresponse, blockresponse])
    })
  })
})
