import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import {
  Block,
  Journey,
  Prisma,
  UserTeamRole
} from '@core/prisma/journeys/client'

import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { BlockResolver } from './block.resolver'
import { BlockService } from './block.service'

describe('BlockResolver', () => {
  let resolver: BlockResolver,
    service: BlockService,
    prismaService: DeepMockProxy<PrismaService>,
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
    PrismaService,
    useFactory: () => ({
      duplicateBlock: jest.fn((block, _parentOrder) => [block, block]),
      removeBlockAndChildren: jest.fn(() => []),
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
        }
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
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

  describe('blockOrderUpdate', () => {
    it('updates the block order', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      expect(await resolver.blockOrderUpdate(ability, 'blockId', 2)).toEqual([
        { ...blockWithUserTeam, parentOrder: 2 }
      ])
      expect(service.reorderBlock).toHaveBeenCalledWith(blockWithUserTeam, 2)
    })

    it('should update journey updatedAt on block order update', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      expect(await resolver.blockOrderUpdate(ability, 'blockId', 2)).toEqual([
        { ...blockWithUserTeam, parentOrder: 2 }
      ])
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: {
          id: blockWithUserTeam.journeyId
        },
        data: { updatedAt: updatedAt.toISOString() }
      })
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.blockOrderUpdate(ability, 'blockId', 2)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.blockOrderUpdate(ability, 'blockId', 2)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })

  describe('blockDuplicate', () => {
    it('duplicates the block and its children', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.blockDuplicate(ability, 'blockId', 2, undefined, 3, 4)
      ).toEqual([blockWithUserTeam, blockWithUserTeam])
      expect(service.duplicateBlock).toHaveBeenCalledWith(
        blockWithUserTeam,
        false,
        2,
        undefined,
        3,
        4
      )
    })

    it('should update journey updatedAt on duplication of the block and its children', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.blockDuplicate(ability, 'blockId', 2, undefined, 3, 4)
      ).toEqual([blockWithUserTeam, blockWithUserTeam])
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: {
          id: blockWithUserTeam.journeyId
        },
        data: { updatedAt: updatedAt.toISOString() }
      })
    })

    it('duplicates the block and its children with custom ids', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.blockDuplicate(
          ability,
          'blockId',
          2,
          [
            { oldId: 'oldButtonId', newId: 'newButtonId' },
            { oldId: 'oldStartIconId', newId: 'newStartIconId' },
            { oldId: 'oldEndIconId', newId: 'newEndIconId' }
          ],
          3,
          4
        )
      ).toEqual([blockWithUserTeam, blockWithUserTeam])
      expect(service.duplicateBlock).toHaveBeenCalledWith(
        blockWithUserTeam,
        false,
        2,
        [
          { oldId: 'oldButtonId', newId: 'newButtonId' },
          { oldId: 'oldStartIconId', newId: 'newStartIconId' },
          { oldId: 'oldEndIconId', newId: 'newEndIconId' }
        ],
        3,
        4
      )
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.blockDuplicate(ability, 'blockId', 2)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.blockDuplicate(ability, 'blockId', 2)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })

  describe('blockDelete', () => {
    it('removes the block and its children', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      expect(await resolver.blockDelete(ability, 'blockId')).toEqual([])
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(
        blockWithUserTeam
      )
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(resolver.blockDelete(ability, 'blockId')).rejects.toThrow(
        'block not found'
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(resolver.blockDelete(ability, 'blockId')).rejects.toThrow(
        'user is not allowed to delete block'
      )
    })
  })

  describe('block', () => {
    it('returns block', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)

      expect(await resolver.block(ability, 'blockId')).toEqual(
        blockWithUserTeam
      )
      expect(prismaService.block.findUnique).toHaveBeenCalledWith({
        where: { id: 'blockId', deletedAt: null },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(resolver.block(ability, 'blockId')).rejects.toThrow(
        'block not found'
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(resolver.block(ability, 'blockId')).rejects.toThrow(
        'user is not allowed to read block'
      )
    })
  })

  describe('blocks', () => {
    const accessibleBlocks: Prisma.BlockWhereInput = { OR: [{}] }

    it('returns blocks', async () => {
      prismaService.block.findMany.mockResolvedValueOnce([block])
      expect(await resolver.blocks(accessibleBlocks)).toEqual([block])
      expect(prismaService.block.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleBlocks, { deletedAt: null }]
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })
    })

    it('should get filtered blocks', async () => {
      prismaService.block.findMany.mockResolvedValueOnce([block])
      expect(
        await resolver.blocks(accessibleBlocks, {
          journeyIds: ['journeyId'],
          typenames: ['StepBlock']
        })
      ).toEqual([block])
      expect(prismaService.block.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            accessibleBlocks,
            {
              journeyId: { in: ['journeyId'] },
              typename: { in: ['StepBlock'] },
              deletedAt: null
            }
          ]
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })
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
