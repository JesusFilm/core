
   
import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('Step', () => {
  let resolver: BlockResolvers

  const block = {
    id: "1",
    journeyId: "2",
    type: 'StepBlock',
    parentBlockId: "3",
    parentOrder: 0,
    locked: true,
    nextBlockId: "4"
  }

  const blockresponse = {
    id: "1",
    journeyId: "2",
    type: 'StepBlock',
    parentBlockId: "3",
    parentOrder: 0,
    locked: true,
    nextBlockId: "4"
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

  describe('StepBlock', () => {
    it('returns StepBlock', async () => {
      expect(resolver.block("1")).resolves.toEqual(blockresponse)
      expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
