import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Action, Block, Journey } from '@core/prisma/journeys/client'

import {
  NavigateToBlockActionInput,
  UserTeamRole
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../../block/block.service'
import { ActionService } from '../action.service'

import { NavigateToBlockActionResolver } from './navigateToBlockAction.resolver'

describe('NavigateToBlockActionResolver', () => {
  let resolver: NavigateToBlockActionResolver,
    prismaService: DeepMockProxy<PrismaService>,
    actionService: DeepMockProxy<ActionService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey

  const stepBlock = {
    typename: 'StepBlock',
    id: 'step',
    journeyId: journey.id,
    parentBlockId: null,
    nextBlockId: 'someId'
  } as unknown as Block

  const cardBlock = {
    typename: 'CardBlock',
    id: 'card',
    journeyId: journey.id,
    parentBlockId: stepBlock.id,
    coverBlockId: 'video'
  } as unknown as Block

  const block: Block & { action: Action; journey?: Journey } = {
    ...({
      id: '1',
      journeyId: '2',
      typename: 'RadioOptionBlock',
      parentBlockId: cardBlock.id,
      parentOrder: 3,
      label: 'label',
      description: 'description',
      updatedAt: new Date()
    } as unknown as Block),
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      url: 'https://google.com',
      blockId: '4',
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
  const input: NavigateToBlockActionInput = {
    gtmEventName: 'gtmEventName',
    blockId: '4'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        NavigateToBlockActionResolver,
        {
          provide: ActionService,
          useValue: mockDeep<ActionService>()
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        }
      ]
    }).compile()
    resolver = module.get<NavigateToBlockActionResolver>(
      NavigateToBlockActionResolver
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    actionService = module.get<ActionService>(
      ActionService
    ) as DeepMockProxy<ActionService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('blockUpdateNavigateToBlockAction', () => {
    it('updates the navigate to block action', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockUpdateNavigateToBlockAction(ability, block.id, input)

      expect(actionService.navigateToBlockActionUpdate).toHaveBeenCalledWith(
        '1',
        blockWithUserTeam,
        input
      )
    })

    it('throws an error if typename is wrong', async () => {
      const wrongBlock = {
        ...blockWithUserTeam,
        typename: 'WrongBlock'
      }
      prismaService.block.findUnique.mockResolvedValueOnce(wrongBlock)
      await expect(
        resolver.blockUpdateNavigateToBlockAction(ability, wrongBlock.id, input)
      ).rejects.toThrow('This block does not support navigate to block actions')
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.blockUpdateNavigateToBlockAction(ability, block.id, input)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.blockUpdateNavigateToBlockAction(ability, block.id, input)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
