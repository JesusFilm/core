import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { PrismaService } from '../../../lib/prisma.service'

describe('GridContainerResolver', () => {
  let resolver: BlockResolver

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'GridContainerBlock',
    parentBlockId: '3',
    parentOrder: 2,
    spacing: 3,
    direction: 'row',
    justifyContent: 'flexStart',
    alignItems: 'center'
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
        UserRoleService,
        JourneyService,
        PrismaService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
  })

  describe('GridContainerBlock', () => {
    it('returns GridContainerBlock', async () => {
      expect(await resolver.block('1')).toEqual(block)
      expect(await resolver.blocks()).toEqual([block, block])
    })
  })
})
