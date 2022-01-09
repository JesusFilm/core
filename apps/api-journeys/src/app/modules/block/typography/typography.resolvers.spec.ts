import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('Typography', () => {
  let resolver: BlockResolvers

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'TypographyBlock',
    parentBlockId: '3',
    parentOrder: 7,
    content: 'text',
    variant: 'h2',
    color: 'primary',
    align: 'left'
  }

  const blockresponse = {
    id: '1',
    journeyId: '2',
    __typename: 'TypographyBlock',
    parentBlockId: '3',
    parentOrder: 7,
    content: 'text',
    variant: 'h2',
    color: 'primary',
    align: 'left'
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

  describe('TypographyBlock', () => {
    it('returns TypographyBlock', async () => {
      expect(await resolver.block('1')).toEqual(blockresponse)
      expect(await resolver.blocks()).toEqual([blockresponse, blockresponse])
    })
  })
})
