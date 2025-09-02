import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Block, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import {
  IconBlockCreateInput,
  IconBlockUpdateInput,
  IconColor,
  IconName,
  IconSize
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { IconBlockResolver } from './icon.resolver'

describe('Icon', () => {
  let resolver: IconBlockResolver,
    service: DeepMockProxy<BlockService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    typename: 'IconBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    name: IconName.ArrowForwardRounded,
    color: IconColor.secondary,
    size: IconSize.lg,
    updatedAt: '2024-10-21T04:32:25.858Z'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: IconBlockCreateInput = {
    id: 'blockId',
    parentBlockId: 'parentBlockId',
    journeyId: 'journeyId',
    name: IconName.ArrowForwardRounded,
    color: IconColor.secondary,
    size: IconSize.lg
  }
  const blockUpdateInput: IconBlockUpdateInput = {
    name: IconName.PlayArrowRounded,
    color: IconColor.primary,
    size: IconSize.sm
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        },
        IconBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<IconBlockResolver>(IconBlockResolver)
    service = module.get<BlockService>(
      BlockService
    ) as DeepMockProxy<BlockService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('iconBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates an IconBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(await resolver.iconBlockCreate(ability, blockCreateInput)).toEqual(
        blockWithUserTeam
      )
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          color: 'secondary',
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          name: 'ArrowForwardRounded',
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: null,
          size: 'lg',
          typename: 'IconBlock'
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

    it('should set journey updatedAt when IconBlock is created', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(await resolver.iconBlockCreate(ability, blockCreateInput)).toEqual(
        blockWithUserTeam
      )
      expect(service.setJourneyUpdatedAt).toHaveBeenCalledWith(
        prismaService,
        blockWithUserTeam
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.iconBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })
  })

  describe('iconBlockUpdate', () => {
    it('updates a IconBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.iconBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.iconBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.iconBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
