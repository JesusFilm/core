import { Test, TestingModule } from '@nestjs/testing'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { PrismaService } from '../../../lib/prisma.service'

describe('GridContainerResolver', () => {
  let resolver: BlockResolver, prismaService: PrismaService

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
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    prismaService.block.findMany = jest.fn().mockResolvedValue([block, block])
  })

  describe('GridContainerBlock', () => {
    it('returns GridContainerBlock', async () => {
      expect(await resolver.block('1')).toEqual(block)
      expect(await resolver.blocks()).toEqual([block, block])
    })
  })
})
