
   
import { Test, TestingModule } from '@nestjs/testing';
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service';

describe('SignUp', () => {
  let resolver: BlockResolvers

  const block = {
    _key: "1",
    journeyId: "2",
    parentBlockId: "0",
    type: 'SignUpBlock',        
    parentOrder: 2,        
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: "2"
    },
    submitIcon: {
      name: 'LockOpenRounded',
      color: 'secondary',
      size: 'lg'
    },
    submitLabel: 'Unlock Now!'
  }
  const blockresponse = {
    id: "1",
    journeyId: "2",
    parentBlockId: "0",
    type: 'SignUpBlock',        
    parentOrder: 2,        
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: "2"
    },
    submitIcon: {
      name: 'LockOpenRounded',
      color: 'secondary',
      size: 'lg'
    },
    submitLabel: 'Unlock Now!'
  }
  
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

  describe('SignUpBlock', () => {
    it('returns SignUpBlock', async () => {
        expect(resolver.block("1")).resolves.toEqual(blockresponse)
        expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
