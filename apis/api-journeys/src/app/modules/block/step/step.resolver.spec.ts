import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Block, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import {
  StepBlockCreateInput,
  StepBlockPositionUpdateInput,
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
    locked: true,
    x: 0,
    y: 0
  }
  const blockUpdateInput: StepBlockUpdateInput = {
    nextBlockId: 'nextBlockId',
    locked: false,
    x: 0,
    y: 0,
    slug: 'Convert To Slug'
  }
  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      getSiblings: jest.fn(() => [block, block]),
      update: jest.fn((input) => input)
    })
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
          x: 0,
          y: 0,
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
      expect(service.update).toHaveBeenCalledWith('blockId', {
        locked: false,
        nextBlockId: 'nextBlockId',
        x: 0,
        y: 0,
        slug: 'convert-to-slug'
      })
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

    it('throws error if next block ID matches current block ID', async () => {
      const wrongBlockUpdateInput = {
        ...blockUpdateInput,
        nextBlockId: block.id
      }
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.stepBlockUpdate(ability, 'blockId', wrongBlockUpdateInput)
      ).rejects.toThrow('nextBlockId cannot be the current step block id')
    })
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
