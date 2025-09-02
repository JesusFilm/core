import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Action, Block, Journey } from '@core/prisma/journeys/client'

import { UserTeamRole } from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { UserRoleService } from '../userRole/userRole.service'

import { ActionResolver } from './action.resolver'
import { ActionService } from './action.service'

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
    email: 'john.smith@example.com',
    phone: null,
    customizable: null,
    parentStepId: null
  }
  const linkAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: null,
    target: 'target',
    url: 'https://google.com',
    email: null,
    phone: null,
    customizable: null,
    parentStepId: null
  }
  const navigateToBlockAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: '4',
    journeyId: null,
    target: null,
    url: null,
    email: null,
    phone: null,
    customizable: null,
    parentStepId: null
  }
  const phoneAction: Action = {
    parentBlockId: 'parentBlockId',
    gtmEventName: 'gtmEventName',
    updatedAt: new Date(),
    blockId: null,
    journeyId: null,
    target: null,
    url: null,
    email: null,
    phone: '1234567890',
    customizable: null,
    parentStepId: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        ActionResolver,
        BlockService,
        ActionService,
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

    it('returns NavigateToBlockAction', () => {
      expect(resolver.__resolveType(navigateToBlockAction)).toBe(
        'NavigateToBlockAction'
      )
    })

    it('returns PhoneAction', () => {
      expect(resolver.__resolveType(phoneAction)).toBe('PhoneAction')
    })
  })

  describe('parentBlock', () => {
    it('returns parentBlock', async () => {
      const action = {
        ...emailAction,
        parentBlock: block
      }
      expect(await resolver.parentBlock(action)).toBe(block)
    })

    it('returns block', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      const action = {
        ...emailAction,
        parentBlockId: block.id
      }
      expect(await resolver.parentBlock(action)).toBe(block)
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

  describe('blockUpdateAction', () => {
    it('updates a navigatge to block action', async () => {
      const input = {
        gtmEventName: null,
        email: null,
        url: undefined,
        target: null,
        blockId: 'blockId'
      }
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)

      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        create: {
          block: { connect: { id: 'blockId' } },
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } }
        },
        include: { parentBlock: { include: { action: true } } },
        update: {
          block: { connect: { id: 'blockId' } },
          email: null,
          gtmEventName: null,
          journey: { disconnect: true },
          phone: null,
          target: null,
          url: null
        },
        where: { parentBlockId: '1' }
      })
    })

    it('updates an link action', async () => {
      const input = {
        gtmEventName: null,
        email: null,
        url: 'www.runscape.com',
        target: null,
        blockId: undefined
      }
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)

      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        create: {
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } },
          target: null,
          url: 'www.runscape.com'
        },
        include: { parentBlock: { include: { action: true } } },
        update: {
          block: { disconnect: true },
          email: null,
          gtmEventName: null,
          journey: { disconnect: true },
          phone: null,
          target: null,
          url: 'www.runscape.com'
        },
        where: { parentBlockId: '1' }
      })
    })

    it('updates an email action', async () => {
      const input = {
        gtmEventName: null,
        email: 'example@example.co.nz',
        url: undefined,
        target: null,
        blockId: undefined
      }
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)

      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        create: {
          email: 'example@example.co.nz',
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } }
        },
        include: { parentBlock: { include: { action: true } } },
        update: {
          block: { disconnect: true },
          email: 'example@example.co.nz',
          gtmEventName: null,
          journey: { disconnect: true },
          phone: null,
          target: null,
          url: null
        },
        where: { parentBlockId: '1' }
      })
    })

    it('updates a phone action', async () => {
      const input = {
        gtmEventName: null,
        email: null,
        url: undefined,
        phone: '1234567890',
        target: null,
        blockId: undefined
      }
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)

      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        create: {
          phone: '1234567890',
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } }
        },
        include: { parentBlock: { include: { action: true } } },
        update: {
          block: { disconnect: true },
          email: null,
          gtmEventName: null,
          journey: { disconnect: true },
          phone: '1234567890',
          target: null,
          url: null
        },
        where: { parentBlockId: '1' }
      })
    })

    it('throws an error if inputs for more than one action update are given', async () => {
      const input = {
        gtmEventName: null,
        email: 'example@example.co.nz',
        url: 'www.letmeUpdateTheURLaswell.com',
        target: null,
        blockId: undefined
      }
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await expect(
        resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)
      ).rejects.toThrow('invalid combination of inputs provided')
    })

    it('throws an error if no valid inputs are given', async () => {
      const input = {
        gtmEventName: null,
        email: null,
        url: undefined,
        target: null,
        blockId: undefined
      }
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await expect(
        resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)
      ).rejects.toThrow('no valid inputs provided')
    })

    it('throws an error if no block is found', async () => {
      const input = {
        gtmEventName: null,
        email: 'example@example.com',
        url: undefined,
        target: null,
        blockId: undefined
      }
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)
      ).rejects.toThrow('block not found')
    })

    it('throws an error if user is not allowed to update block', async () => {
      const input = {
        gtmEventName: null,
        email: 'example@example.com',
        url: undefined,
        target: null,
        blockId: undefined
      }
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)
      ).rejects.toThrow('user is not allowed to update block')
    })

    it('throws an error if block does not support actions', async () => {
      const wrongBlock = {
        ...blockWithUserTeam,
        typename: 'ImageBlock'
      }
      const input = {
        gtmEventName: null,
        email: 'example@example.com',
        url: undefined,
        target: null,
        blockId: undefined
      }
      prismaService.block.findUnique.mockResolvedValueOnce(wrongBlock)
      await expect(
        resolver.blockUpdateAction(ability, blockWithUserTeam.id, input)
      ).rejects.toThrow('This block does not support actions')
    })
  })
})
