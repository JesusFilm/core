import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import {
  StepBlockCreateInput,
  StepBlockUpdateInput
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { StepBlockResolver } from './step.resolver'

describe('StepBlockResolver', () => {
  let resolver: StepBlockResolver,
    service: BlockService,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    typename: 'StepBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    locked: true,
    nextBlockId: 'nextBlockId'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: StepBlockCreateInput = {
    id: 'blockId',
    journeyId: 'journeyId',
    nextBlockId: 'nextBlockId',
    locked: true
  }
  const blockUpdateInput: StepBlockUpdateInput = {
    nextBlockId: 'nextBlockId',
    locked: false
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
        StepBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<StepBlockResolver>(StepBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('stepBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a StepBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(await resolver.stepBlockCreate(ability, blockCreateInput)).toEqual(
        blockWithUserTeam
      )
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: {
            connect: {
              id: 'journeyId'
            }
          },
          locked: true,
          nextBlock: {
            connect: {
              id: 'nextBlockId'
            }
          },
          parentOrder: 2,
          typename: 'StepBlock'
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
        blockCreateInput.journeyId
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.stepBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })
  })

  describe('stepBlockUpdate', () => {
    it('updates a StepBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.stepBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.stepBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.stepBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })

  describe('locked', () => {
    it('returns locked when true', () => {
      expect(resolver.locked({ ...block, locked: true })).toBe(true)
    })

    it('returns locked when false', () => {
      expect(resolver.locked({ ...block, locked: false })).toBe(false)
    })

    it('returns false when locked is null', () => {
      expect(resolver.locked({ ...block, locked: null })).toBe(false)
    })
  })
})
