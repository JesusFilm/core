
   
import { Test, TestingModule } from '@nestjs/testing';
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service';

describe('GridItem', () => {
  let resolver: BlockResolvers

  const block = {
    _key: "1",
    journeyId: "2",
    type: 'GridItemBlock',
    parentBlockId: "3",
    parentOrder: 2,
    xl: 6,
    lg: 6,
    sm: 6
  };
  const blockresponse = {
    id: "1",
    journeyId: "2",
    type: 'GridItemBlock',
    parentBlockId: "3",
    parentOrder: 2,
    xl: 6,
    lg: 6,
    sm: 6
  };
  
  const blockservice = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() =>  block),
      getAll: jest.fn(() => [block, block])
    })
  };

 
  beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
          providers: [BlockResolvers, blockservice]
      }).compile()
      resolver = module.get<BlockResolvers>(BlockResolvers);
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('GridItemBlock', () => {
    it('returns GridItemBlock', async () => {
        expect(resolver.block("1")).resolves.toEqual(blockresponse)
        expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
