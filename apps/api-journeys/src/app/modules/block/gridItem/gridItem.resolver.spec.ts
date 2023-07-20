import { Test, TestingModule } from '@nestjs/testing'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { PrismaService } from '../../../lib/prisma.service'

describe('GridItemResolver', () => {
  let resolver: BlockResolver, prismaService: PrismaService

  const block = {
    id: '1',
    journeyId: '2',
    typename: 'GridItemBlock',
    parentBlockId: '3',
    parentOrder: 2,
    xl: 6,
    lg: 6,
    sm: 6
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        BlockService,
        UserJourneyService,
        UserRoleService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValue(block)
    prismaService.block.findMany = jest.fn().mockResolvedValue([block, block])
  })

  describe('GridItemBlock', () => {
    it('returns GridItemBlock', async () => {
      expect(await resolver.block('1')).toEqual(block)
      expect(await resolver.blocks()).toEqual([block, block])
    })
  })
})
