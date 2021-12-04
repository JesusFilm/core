
   
import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('VideoBlock', () => {
  let resolver: BlockResolvers

  const block = {
    _key: "1",
    journeyId: "2",
    blockType: 'VideoBlock',
    parentBlockId: "3",
    parentOrder: 1,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const blockresponse =  {
    id: "1",
    journeyId: "2",
    blockType: 'VideoBlock',
    parentBlockId: "3",
    parentOrder: 1,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
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

  describe('VideoBlock', () => {
    it('returns VideoBlock', async () => {
      expect(resolver.block("1")).resolves.toEqual(blockresponse)
      expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
