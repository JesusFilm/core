import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('SignUp', () => {
  let resolver: BlockResolvers

  const block = {
    _key: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'SignUpBlock',
    parentOrder: 2,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '2'
    },
    submitIcon: {
      name: 'LockOpenRounded',
      color: 'secondary',
      size: 'lg'
    },
    submitLabel: 'Unlock Now!'
  }
  const blockresponse = {
    id: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'SignUpBlock',
    parentOrder: 2,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '2'
    },
    submitIcon: {
      name: 'LockOpenRounded',
      color: 'secondary',
      size: 'lg'
    },
    submitLabel: 'Unlock Now!'
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

  describe('SignUpBlock', () => {
    it('returns SignUpBlock', async () => {
      expect(await resolver.block('1')).toEqual(blockresponse)
      expect(await resolver.blocks()).toEqual([blockresponse, blockresponse])
    })
  })
})
