
   
import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('Button', () => {
  let resolver: BlockResolvers

  const block = {
    _key: "1",
    journeyId: "2",
    __typename: 'ButtonBlock',
    parentBlockId: "0",
    parentOrder: 1,
    label: 'label',
    variant: 'contained',
    color: 'primary',
    size: 'large',
    startIcon: {
      name: 'ArrowForwardRounded',
      color: 'secondary',
      size: 'lg'
    },
    endIcon: {
      name: 'LockOpenRounded',
      color: 'action',
      size: 'xl'
    },
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
  }
  const blockresponse = {
    id: "1",
    journeyId: "2",
    __typename: 'ButtonBlock',
    parentBlockId: "0",
    parentOrder: 1,
    label: 'label',
    variant: 'contained',
    color: 'primary',
    size: 'large',
    startIcon: {
      name: 'ArrowForwardRounded',
      color: 'secondary',
      size: 'lg'
    },
    endIcon: {
      name: 'LockOpenRounded',
      color: 'action',
      size: 'xl'
    },
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
  }
  
  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() =>  block),
      getAll: jest.fn(() => [block, block])
    })
  }

 
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockResolvers, blockService]
    }).compile()
    resolver = module.get<BlockResolvers>(BlockResolvers)
  })

  describe('ButtonBlock', () => {
    it('returns ButtonBlock', async () => {
      expect(resolver.block("1")).resolves.toEqual(blockresponse)
      expect(resolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })
})
