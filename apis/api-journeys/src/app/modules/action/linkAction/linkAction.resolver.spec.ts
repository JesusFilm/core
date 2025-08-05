import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Action, Block, Journey } from '@core/prisma/journeys/client'

import { LinkActionInput, UserTeamRole } from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { ActionService } from '../action.service'

import { LinkActionResolver } from './linkAction.resolver'

describe('LinkActionResolver', () => {
  let resolver: LinkActionResolver,
    prismaService: DeepMockProxy<PrismaService>,
    actionService: DeepMockProxy<ActionService>,
    ability: AppAbility

  const action: Action = {
    parentBlockId: '1',
    gtmEventName: 'LinkAction',
    url: 'https://google.com',
    blockId: null,
    journeyId: null,
    target: null,
    email: null,
    updatedAt: new Date()
  }
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
    action
  }
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const input: LinkActionInput = {
    gtmEventName: 'LinkAction',
    url: 'https://google.com'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        LinkActionResolver,
        {
          provide: ActionService,
          useValue: mockDeep<ActionService>()
        },
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
    actionService = module.get<ActionService>(
      ActionService
    ) as DeepMockProxy<ActionService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('url', () => {
    it('should return url', async () => {
      await expect(resolver.url(action)).toBe('https://google.com')
    })

    it('should return empty string if url is null', async () => {
      await expect(resolver.url({ ...action, url: null })).toBe('')
    })
  })

  describe('blockUpdateLinkAction', () => {
    it('updates link action', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockUpdateLinkAction(ability, block.id, input)
      expect(actionService.linkActionUpdate).toHaveBeenCalledWith(
        '1',
        blockWithUserTeam,
        input
      )
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
