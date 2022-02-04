import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'

describe('GridContainerResolver', () => {
  let resolver: BlockResolver

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
  const blockResponse = {
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
      providers: [BlockResolver, blockService]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
  })

  describe('GridContainerBlock', () => {
    it('returns GridContainerBlock', async () => {
      expect(await resolver.block('1')).toEqual(blockResponse)
      expect(await resolver.blocks()).toEqual([blockResponse, blockResponse])
    })
  })
})
