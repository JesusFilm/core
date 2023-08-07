import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Action, Block, Journey } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { LinkActionInput, UserTeamRole } from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { ACTION_UPDATE_RESET } from '../actionUpdateReset'

import { LinkActionResolver } from './linkAction.resolver'

describe('LinkActionResolver', () => {
  let resolver: LinkActionResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block: Block & { action: Action; journey?: Journey } = {
    ...({
      id: '1',
      journeyId: '2',
      typename: 'SignUpBlock',
      parentBlockId: '3',
      parentOrder: 3,
      label: 'label',
      description: 'description',
      updatedAt: new Date()
    } as unknown as Block),
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      url: 'https://google.com',
      blockId: null,
      journeyId: null,
      target: null,
      email: null,
      updatedAt: new Date()
    }
  }
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const input: LinkActionInput = {
    gtmEventName: 'gtmEventName',
    url: 'https://google.com'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        LinkActionResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<LinkActionResolver>(LinkActionResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('blockUpdateLinkAction', () => {
    it('updates link action', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockUpdateLinkAction(ability, block.id, input)
      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        where: { parentBlockId: block.id },
        create: {
          ...input,
          parentBlock: { connect: { id: block.id } }
        },
        update: {
          ...ACTION_UPDATE_RESET,
          ...input
        }
      })
    })

    it('throws error if typename is wrong', async () => {
      const wrongBlock = {
        ...blockWithUserTeam,
        typename: 'WrongBlock'
      }
      prismaService.block.findUnique.mockResolvedValueOnce(wrongBlock)
      await expect(
        resolver.blockUpdateLinkAction(ability, wrongBlock.id, input)
      ).rejects.toThrow('This block does not support link actions')
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.blockUpdateLinkAction(ability, block.id, input)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.blockUpdateLinkAction(ability, block.id, input)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
