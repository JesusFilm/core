import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Action, Block, Journey } from '@core/prisma/journeys/client'

import { PhoneActionInput, UserTeamRole } from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { ActionService } from '../action.service'

import { PhoneActionResolver } from './phoneAction.resolver'

describe('PhoneActionResolver', () => {
  let resolver: PhoneActionResolver,
    prismaService: DeepMockProxy<PrismaService>,
    actionService: DeepMockProxy<ActionService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block: Block & { action: Action; journey?: Journey } = {
    ...({
      id: '1',
      journeyId: '2',
      typename: 'RadioOptionBlock',
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
      phone: '1234567890',
      countryCode: 'US',
      customizable: null,
      parentStepId: null,
      updatedAt: new Date()
    }
  }
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const input: PhoneActionInput = {
    gtmEventName: 'gtmEventName',
    phone: '1234567890',
    countryCode: 'US'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        PhoneActionResolver,
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
    resolver = module.get<PhoneActionResolver>(PhoneActionResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    actionService = module.get<ActionService>(
      ActionService
    ) as DeepMockProxy<ActionService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('blockUpdatePhoneAction', () => {
    it('updates phone action', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.blockUpdatePhoneAction(ability, block.id, input)
      expect(actionService.phoneActionUpdate).toHaveBeenCalledWith(
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
        resolver.blockUpdatePhoneAction(ability, wrongBlock.id, input)
      ).rejects.toThrow('This block does not support phone actions')
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.blockUpdatePhoneAction(ability, block.id, input)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.blockUpdatePhoneAction(ability, block.id, input)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
