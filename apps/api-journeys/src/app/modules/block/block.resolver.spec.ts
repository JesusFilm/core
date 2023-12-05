import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

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
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
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
    journey
  }
  const blockService = {
    provide: BlockService,
    PrismaService,
    useFactory: () => ({
      duplicateBlock: jest.fn((block, _parentOrder) => [block, block]),
      removeBlockAndChildren: jest.fn(() => []),
      reorderBlock: jest.fn((block, parentOrder) => [{ ...block, parentOrder }])
    })
  }

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
      expect(await resolver.blockDuplicate(ability, 'blockId', 2)).toEqual([
        blockWithUserTeam,
        blockWithUserTeam
      ])
      expect(service.duplicateBlock).toHaveBeenCalledWith(blockWithUserTeam, 2)
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

      expect(await resolver.block('blockId')).toEqual(blockWithUserTeam)
      expect(prismaService.block.findUnique).toHaveBeenCalledWith({
        where: { id: 'blockId' },
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
      await expect(resolver.block('blockId')).rejects.toThrow('block not found')
    })
  })
})
