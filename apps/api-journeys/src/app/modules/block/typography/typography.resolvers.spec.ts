
   
import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('Typography', () => {
  let resolver: BlockResolvers

  const block = {
    _key: "1",
    journeyId: "2",
    type: 'TypographyBlock',
    parentBlockId: "3",
    parentOrder: 7,
    content: 'text',
    variant: 'h2',
    color: 'primary',
    align: 'left'
  }

  const blockresponse =  {
    id: "1",
    journeyId: "2",
    type: 'TypographyBlock',
    parentBlockId: "3",
    parentOrder: 7,
    content: 'text',
    variant: 'h2',
    color: 'primary',
    align: 'left'
  }
  
  const blockservice = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() =>  block),
      getAll: jest.fn(() => [block, block])
    })
  }

 
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockResolvers, blockservice]
    }).compile()
    resolver = module.get<BlockResolvers>(BlockResolvers)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('TypographyBlock', () => {
    it('returns TypographyBlock', async () => {
      expect(resolver.block("1")).resolves.toEqual(blockresponse)
      expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
