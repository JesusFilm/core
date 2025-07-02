import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import {
  TypographyAlign,
  TypographyBlockCreateInput,
  TypographyBlockUpdateInput,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { TypographyBlockResolver } from './typography.resolver'

describe('TypographyBlockResolver', () => {
  let resolver: TypographyBlockResolver,
    service: DeepMockProxy<BlockService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    __typename: 'TypographyBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 7,
    content: 'content',
    variant: TypographyVariant.h2,
    color: TypographyColor.primary,
    align: TypographyAlign.left,
    updatedAt: '2024-10-21T04:32:25.858Z',
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: TypographyBlockCreateInput = {
    id: 'blockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    content: 'content',
    variant: TypographyVariant.h2,
    color: TypographyColor.primary,
    align: TypographyAlign.left
  }
  const blockUpdateInput: TypographyBlockUpdateInput = {
    parentBlockId: 'parentBlockId',
    content: 'newContent',
    variant: TypographyVariant.h3,
    color: TypographyColor.secondary,
    align: TypographyAlign.right
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        },
        TypographyBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<TypographyBlockResolver>(TypographyBlockResolver)
    service = module.get<BlockService>(
      BlockService
    ) as DeepMockProxy<BlockService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
    service.getSiblings.mockResolvedValue([
      { ...block, action: null },
      { ...block, action: null }
    ])
  })

  describe('typographyBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a TypographyBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.typographyBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          align: 'left',
          color: 'primary',
          id: 'blockId',
          content: 'content',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: 2,
          typename: 'TypographyBlock',
          variant: 'h2'
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
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockCreateInput.journeyId,
        blockCreateInput.parentBlockId
      )
    })

    it('should set journey updatedAt when typography is created', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.typographyBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(service.setJourneyUpdatedAt).toHaveBeenCalledWith(
        prismaService,
        blockWithUserTeam
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.typographyBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })
  })

  describe('typographyBlockUpdate', () => {
    it('updates a TypographyBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.typographyBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.typographyBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.typographyBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
