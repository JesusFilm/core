import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'

describe('VideoTriggerBlockResolver', () => {
  let resolver: BlockResolver

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
      providers: [BlockResolver, blockService]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
  })

  describe('VideoTriggerBlock', () => {
    it('returns VideoTriggerBlock', async () => {
      expect(await resolver.block('1')).toEqual(blockresponse)
      expect(await resolver.blocks()).toEqual([blockresponse, blockresponse])
    })
  })
})
