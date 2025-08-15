import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Block, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import {
  RadioOptionBlockCreateInput,
  RadioOptionBlockUpdateInput
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { RadioOptionBlockResolver } from './radioOption.resolver'

describe('RadioQuestionBlockResolver', () => {
  let resolver: RadioOptionBlockResolver,
    service: DeepMockProxy<BlockService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 3,
    label: 'label',
    updatedAt: '2024-10-21T04:32:25.858Z'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }

  const blockCreateInput: RadioOptionBlockCreateInput = {
    id: 'blockId',
    parentBlockId: 'parentBlockId',
    journeyId: 'journeyId',
    label: 'label'
  }

  const blockUpdateInput: RadioOptionBlockUpdateInput = {
    parentBlockId: 'parentBlockId',
    label: 'label',
    pollOptionImageBlockId: 'pollOptionImageBlockId'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        },
        RadioOptionBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<RadioOptionBlockResolver>(RadioOptionBlockResolver)
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

  describe('radioOptionBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a RadioOptionBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.radioOptionBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: 2,
          typename: 'RadioOptionBlock',
          label: 'label'
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

    it('should set journey updatedAt when radio option is created', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.radioOptionBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockCreateInput.journeyId,
        blockCreateInput.parentBlockId
      )
      expect(service.setJourneyUpdatedAt).toHaveBeenCalledWith(
        prismaService,
        blockWithUserTeam
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.radioOptionBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })
  })

  describe('radioOptionBlockUpdate', () => {
    it('updates a RadioOptionBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.radioOptionBlockUpdate(
        ability,
        'blockId',
        blockUpdateInput
      )
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.radioOptionBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.radioOptionBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
