import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import {
  CardBlockUpdateInput,
  ThemeMode,
  ThemeName
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../../lib/CaslAuthModule'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { CardBlockResolver } from './card.resolver'

describe('CardBlockResolver', () => {
  let resolver: CardBlockResolver,
    service: DeepMockProxy<BlockService>,
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
    themeName: ThemeName.base,
    updatedAt: '2024-10-21T04:32:25.858Z'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockUpdateInput: CardBlockUpdateInput = {
    parentBlockId: 'parentBlockId',
    backgroundColor: '#FFF',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    fullscreen: true,
    coverBlockId: 'coverBlockId'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        },
        CardBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<CardBlockResolver>(CardBlockResolver)
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
