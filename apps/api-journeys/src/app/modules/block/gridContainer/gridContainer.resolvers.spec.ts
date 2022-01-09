import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('GridContainer', () => {
  let resolver: BlockResolvers

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'GridContainerBlock',
    parentBlockId: '3',
    parentOrder: 2,
    spacing: 3,
    direction: 'row',
    justifyContent: 'flexStart',
    alignItems: 'center'
  }
  const blockresponse = {
    id: '1',
    journeyId: '2',
    __typename: 'GridContainerBlock',
    parentBlockId: '3',
    parentOrder: 2,
    spacing: 3,
    direction: 'row',
    justifyContent: 'flexStart',
    alignItems: 'center'
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

  describe('GridContainerBlock', () => {
    it('returns GridContainerBlock', async () => {
      expect(await resolver.block('1')).toEqual(blockresponse)
      expect(await resolver.blocks()).toEqual([blockresponse, blockresponse])
    })
  })
})
