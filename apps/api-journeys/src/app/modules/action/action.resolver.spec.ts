import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Action, Block, Journey } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { UserTeamRole } from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { UserRoleService } from '../userRole/userRole.service'

import { ActionResolver } from './action.resolver'

describe('ActionResolver', () => {
  let resolver: ActionResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey

  const block = {
    id: '1',
    journeyId: '2',
    typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const emailAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: null,
    target: null,
    url: null,
    email: 'john.smith@example.com'
  }
  const linkAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: null,
    target: 'target',
    url: 'https://google.com',
    email: null
  }
  const navigateAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: null,
    target: null,
    url: null,
    email: null
  }
  const navigateToBlockAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: '4',
    journeyId: null,
    target: null,
    url: null,
    email: null
  }
  const navigateToJourneyAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: '4',
    target: null,
    url: null,
    email: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        ActionResolver,
        BlockService,
        UserRoleService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<ActionResolver>(ActionResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('__resolveType', () => {
    it('returns EmailAction', () => {
      expect(resolver.__resolveType(emailAction)).toBe('EmailAction')
    })

    it('returns LinkAction', () => {
      expect(resolver.__resolveType(linkAction)).toBe('LinkAction')
    })

    it('returns NavigateAction', () => {
      expect(resolver.__resolveType(navigateAction)).toBe('NavigateAction')
    })

    it('returns NavigateToBlockAction', () => {
      expect(resolver.__resolveType(navigateToBlockAction)).toBe(
        'NavigateToBlockAction'
      )
    })

    it('returns NavigateToJourneyAction', () => {
      expect(resolver.__resolveType(navigateToJourneyAction)).toBe(
        'NavigateToJourneyAction'
      )
    })
  })

  describe('blockDeleteAction', () => {
    it('deletes the block action', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockDeleteAction(ability, blockWithUserTeam.id)

      expect(prismaService.action.delete).toHaveBeenCalledWith({
        where: { parentBlockId: blockWithUserTeam.id }
      })
    })

    it('throws an error if typename is wrong', async () => {
      const wrongBlock = {
        ...blockWithUserTeam,
        typename: 'WrongBlock'
      }
      prismaService.block.findUnique.mockResolvedValueOnce(wrongBlock)
      await expect(
        resolver.blockDeleteAction(ability, wrongBlock.id)
      ).rejects.toThrow('This block does not support actions')
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.blockDeleteAction(ability, block.id)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.blockDeleteAction(ability, block.id)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
