import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import { StepBlockPositionUpdateInput } from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../../lib/CaslAuthModule'
import { PrismaService } from '../../../lib/prisma.service'

import { StepBlockResolver } from './step.resolver'

describe('StepBlockResolver', () => {
  let resolver: StepBlockResolver,
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

  const updatedAt: Date = new Date('2024-10-22T03:39:39.268Z')

  beforeAll(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(updatedAt)
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        StepBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<StepBlockResolver>(StepBlockResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('stepBlockPositionUpdate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    const blockPositionUpdateInput: StepBlockPositionUpdateInput = {
      id: 'blockId',
      x: 0,
      y: 0
    }

    it('updates an array of StepBlock positions', async () => {
      prismaService.block.findMany.mockResolvedValueOnce([
        blockWithUserTeam,
        { ...blockWithUserTeam, id: 'blockId2' }
      ])
      await resolver.stepBlockPositionUpdate(ability, [
        blockPositionUpdateInput,
        { id: 'blockId2', x: 1, y: 1 }
      ])
      expect(prismaService.block.update).toHaveBeenCalledWith({
        where: { id: 'blockId' },
        data: {
          x: 0,
          y: 0
        }
      })
      expect(prismaService.block.update).toHaveBeenCalledWith({
        where: { id: 'blockId2' },
        data: {
          x: 1,
          y: 1
        }
      })
    })

    it('should set the journey updatedAt when step positions are updated', async () => {
      prismaService.block.findMany.mockResolvedValueOnce([
        blockWithUserTeam,
        { ...blockWithUserTeam, id: 'blockId2' }
      ])
      await resolver.stepBlockPositionUpdate(ability, [
        blockPositionUpdateInput,
        { id: 'blockId2', x: 1, y: 1 }
      ])
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: {
          id: block.journeyId
        },
        data: { updatedAt: updatedAt.toISOString() }
      })
    })

    it('throws error if not found', async () => {
      prismaService.block.findMany.mockResolvedValueOnce([])
      await expect(
        resolver.stepBlockPositionUpdate(ability, [blockPositionUpdateInput])
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findMany.mockResolvedValueOnce([block])
      await expect(
        resolver.stepBlockPositionUpdate(ability, [blockPositionUpdateInput])
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
