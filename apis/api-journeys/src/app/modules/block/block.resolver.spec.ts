import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyCustomizableService } from '../journey/journeyCustomizable.service'

import { BlockResolver } from './block.resolver'
import { BlockService } from './block.service'

describe('BlockResolver', () => {
  let resolver: BlockResolver,
    service: BlockService,
    prismaService: DeepMockProxy<PrismaService>,
    journeyCustomizableService: DeepMockProxy<JourneyCustomizableService>,
    ability: AppAbility

  const journey = {
    id: '2'
  } as unknown as Journey

  const journeyWithUserTeam = {
    ...journey,
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  }

  const block: Block = {
    id: 'blockId',
    journeyId: '2',
    typename: 'ImageBlock',
    parentBlockId: 'card1',
    parentOrder: 0,
    src: 'https://source.unsplash.com/random/1920x1080',
    alt: 'random image from unsplash',
    width: 1920,
    height: 1080,
    label: 'label',
    description: 'description',
    updatedAt: new Date()
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey: journeyWithUserTeam
  }
  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      reorderBlock: jest.fn((block, parentOrder) => [
        { ...block, parentOrder }
      ]),
      getDescendants: jest.fn(() => [])
    })
  }

  const updatedAt: Date = new Date('2024-10-22T03:39:39.268Z')

  beforeAll(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(updatedAt)
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        BlockResolver,
        blockService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: JourneyCustomizableService,
          useValue: mockDeep<JourneyCustomizableService>()
        }
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    journeyCustomizableService = module.get<JourneyCustomizableService>(
      JourneyCustomizableService
    ) as DeepMockProxy<JourneyCustomizableService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
    prismaService.$transaction.mockImplementation(
      async (callback) => await callback(prismaService)
    )
  })

  describe('__resolveType', () => {
    it('returns __typename', () => {
      expect(
        resolver.__resolveType({
          __typename: 'VideoBlock',
          typename: 'VideoOtherBlock'
        })
      ).toBe('VideoBlock')
    })

    it('returns typename when no __typename', () => {
      expect(resolver.__resolveType({ typename: 'VideoBlock' })).toBe(
        'VideoBlock'
      )
    })
  })

  describe('blockRestore', () => {
    it('should restore block', async () => {
      prismaService.block.findUnique.mockResolvedValue(blockWithUserTeam)
      prismaService.block.update.mockResolvedValue(block)
      prismaService.block.findMany.mockResolvedValue([block, block])
      await resolver.blockRestore('1', ability)
      expect(prismaService.block.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          deletedAt: null
        },
        include: {
          action: true
        }
      })
      expect(service.reorderBlock).toHaveBeenCalledWith(
        block,
        block.parentOrder,
        prismaService
      )
      expect(prismaService.block.findMany).toHaveBeenCalledWith({
        where: {
          journeyId: block.journeyId,
          deletedAt: null,
          NOT: { id: block.id }
        },
        include: {
          action: true
        }
      })
      expect(service.getDescendants).toHaveBeenCalledWith(block.id, [
        block,
        block
      ])
    })

    it('should update journey updatedAt on block restore', async () => {
      prismaService.block.findUnique.mockResolvedValue(blockWithUserTeam)
      prismaService.block.update.mockResolvedValue(block)
      prismaService.block.findMany.mockResolvedValue([block, block])
      await resolver.blockRestore('1', ability)
      expect(prismaService.block.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          deletedAt: null
        },
        include: {
          action: true
        }
      })
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: {
          id: block.journeyId
        },
        data: { updatedAt: updatedAt.toISOString() }
      })
    })

    it('should call recalculate after block restore', async () => {
      prismaService.block.findUnique.mockResolvedValue(blockWithUserTeam)
      prismaService.block.update.mockResolvedValue(block)
      prismaService.block.findMany.mockResolvedValue([block, block])
      await resolver.blockRestore('1', ability)
      expect(journeyCustomizableService.recalculate).toHaveBeenCalledWith(
        block.journeyId
      )
    })

    it('should throw error if block not found', async () => {
      await expect(resolver.blockRestore('1', ability)).rejects.toThrow(
        'block not found'
      )
    })

    it('should only return the updated block without its siblings if parent order is null', async () => {
      const blockWithoutParentOrder = {
        ...blockWithUserTeam,
        parentOrder: null
      }

      prismaService.block.findUnique.mockResolvedValue(blockWithoutParentOrder)
      prismaService.block.update.mockResolvedValue(blockWithoutParentOrder)

      expect(await resolver.blockRestore('1', ability)).toEqual([
        blockWithoutParentOrder
      ])
    })

    it('should throw error if user does not have the correct permissions', async () => {
      prismaService.block.findUnique.mockResolvedValue(block)
      prismaService.block.update.mockResolvedValue(block)
      await expect(resolver.blockRestore('1', ability)).rejects.toThrow(
        'user is not allowed to update block'
      )
    })
  })
})
