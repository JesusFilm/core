import { Test, TestingModule } from '@nestjs/testing'
import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import {
  TypographyAlign,
  TypographyBlockCreateInput,
  TypographyBlockUpdateInput,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { TypographyBlockResolver } from './typography.resolver'

describe('TypographyBlockResolver', () => {
  let resolver: TypographyBlockResolver,
    service: BlockService,
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
    align: TypographyAlign.left
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
  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      getSiblings: jest.fn(() => [block, block]),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        blockService,
        TypographyBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<TypographyBlockResolver>(TypographyBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
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
