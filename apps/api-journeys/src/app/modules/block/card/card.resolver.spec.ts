import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import {
  CardBlockCreateInput,
  CardBlockUpdateInput,
  ThemeMode,
  ThemeName
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { CardBlockResolver } from './card.resolver'

describe('CardBlockResolver', () => {
  let resolver: CardBlockResolver,
    service: BlockService,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    typename: 'CardBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    backgroundColor: '#FFF',
    fullscreen: true,
    themeMode: ThemeMode.light,
    themeName: ThemeName.base
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: CardBlockCreateInput = {
    id: 'blockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    backgroundColor: '#FFF',
    fullscreen: true,
    themeMode: ThemeMode.light,
    themeName: ThemeName.base
  }
  const blockUpdateInput: CardBlockUpdateInput = {
    parentBlockId: 'parentBlockId',
    backgroundColor: '#FFF',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true
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
        CardBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<CardBlockResolver>(CardBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('cardBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a CardBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(await resolver.cardBlockCreate(ability, blockCreateInput)).toEqual(
        blockWithUserTeam
      )
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          backgroundColor: '#FFF',
          themeMode: ThemeMode.light,
          themeName: ThemeName.base,
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: 2,
          typename: 'CardBlock',
          fullscreen: true
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
        resolver.cardBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })
  })

  describe('cardBlockUpdate', () => {
    it('updates a CardBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.cardBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.cardBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.cardBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })

  describe('fullscreen', () => {
    it('returns fullscreen when true', () => {
      expect(resolver.fullscreen({ ...block, fullscreen: true })).toBe(true)
    })

    it('returns fullscreen when false', () => {
      expect(resolver.fullscreen({ ...block, fullscreen: false })).toBe(false)
    })

    it('returns false when fullscreen is null', () => {
      expect(resolver.fullscreen({ ...block, fullscreen: null })).toBe(false)
    })
  })
})
