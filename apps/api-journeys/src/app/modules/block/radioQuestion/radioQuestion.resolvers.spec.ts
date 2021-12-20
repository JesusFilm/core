import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('RadioQuestion', () => {
  let resolver: BlockResolvers

  const block = {
    _key: "1",
    journeyId: "2",
    type: 'RadioOptionBlock',
    parentBlockId: "3",
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      blockId: "4"
    }
  }

  const blockresponse = {
    id: "1",
    journeyId: "2",
    type: 'RadioOptionBlock',
    parentBlockId: "3",
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      blockId: "4"
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

  describe('RadioQuestionBlock', () => {
    it('returns RadioQuestionBlock', async () => {
      expect(resolver.block("1")).resolves.toEqual(blockresponse)
      expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
