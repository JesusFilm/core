import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { UserJourneyService } from '../../userJourney/userJourney.service'

import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'

describe('GridItemResolver', () => {
  let resolver: BlockResolver

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'GridItemBlock',
    parentBlockId: '3',
    parentOrder: 2,
    xl: 6,
    lg: 6,
    sm: 6
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
      providers: [
        BlockResolver,
        blockService,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
  })

  describe('GridItemBlock', () => {
    it('returns GridItemBlock', async () => {
      expect(await resolver.block('1')).toEqual(block)
      expect(await resolver.blocks()).toEqual([block, block])
    })
  })
})
