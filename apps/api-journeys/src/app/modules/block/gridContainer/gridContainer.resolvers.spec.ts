
   
import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('GridContainer', () => {
  let resolver: BlockResolvers

  const block = {
    _key: "1",
    journeyId: "2",
    type: 'GridContainerBlock',
    parentBlockId: "3",
    parentOrder: 2,
    spacing: 3,
    direction: 'row',
    justifyContent: 'flexStart',
    alignItems: 'center'
  }
  const blockresponse = {
    id: "1",
    journeyId: "2",
    type: 'GridContainerBlock',
    parentBlockId: "3",
    parentOrder: 2,
    spacing: 3,
    direction: 'row',
    justifyContent: 'flexStart',
    alignItems: 'center'
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

  describe('GridContainerBlock', () => {
    it('returns GridContainerBlock', async () => {
      expect(resolver.block("1")).resolves.toEqual(blockresponse)
      expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
