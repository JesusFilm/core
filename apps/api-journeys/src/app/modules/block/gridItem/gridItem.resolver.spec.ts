import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'

describe('GridItemResolver', () => {
  let resolver: BlockResolver

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'GridItemBlock',
    parentBlockId: '3',
    parentOrder: 2,
    xl: 6,
    lg: 6,
    sm: 6
  }
  const blockresponse = {
    id: '1',
    journeyId: '2',
    __typename: 'GridItemBlock',
    parentBlockId: '3',
    parentOrder: 2,
    xl: 6,
    lg: 6,
    sm: 6
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

  describe('GridItemBlock', () => {
    it('returns GridItemBlock', async () => {
      expect(await resolver.block('1')).toEqual(blockresponse)
      expect(await resolver.blocks()).toEqual([blockresponse, blockresponse])
    })
  })
})
