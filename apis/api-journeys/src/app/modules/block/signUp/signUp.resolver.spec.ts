import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Block, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import {
  SignUpBlockCreateInput,
  SignUpBlockUpdateInput
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { SignUpBlockResolver } from './signUp.resolver'

describe('SignUpBlockResolver', () => {
  let resolver: SignUpBlockResolver,
    service: DeepMockProxy<BlockService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    __typename: 'SignUpBlock',
    parentOrder: 1,
    submitIconId: 'submitIconId',
    submitLabel: 'Unlock Now!',
    updatedAt: '2024-10-21T04:32:25.858Z'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: SignUpBlockCreateInput = {
    id: 'blockId',
    parentBlockId: 'parentBlockId',
    journeyId: 'journeyId',
    submitLabel: 'Submit'
  }
  const blockUpdateInput: SignUpBlockUpdateInput = {
    parentBlockId: 'parentBlockId',
    submitIconId: 'icon1',
    submitLabel: 'Unlock Later!'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        },
        SignUpBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<SignUpBlockResolver>(SignUpBlockResolver)
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

  describe('SignUpBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a SignUpBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.signUpBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: 2,
          typename: 'SignUpBlock',
          submitLabel: 'Submit'
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

    it('should set journey updatedAt when sign up is created', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.signUpBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(service.setJourneyUpdatedAt).toHaveBeenCalledWith(
        prismaService,
        blockWithUserTeam
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.signUpBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })
  })

  describe('SignUpBlockUpdate', () => {
    let mockValidate: jest.MockedFunction<typeof service.validateBlock>

    beforeEach(() => {
      mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValue(true)
    })

    it('updates a SignUpBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.signUpBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throw error if submitIconId does not exist', async () => {
      mockValidate.mockResolvedValueOnce(false)

      await expect(
        resolver.signUpBlockUpdate(ability, 'blockId', {
          ...blockUpdateInput,
          submitIconId: 'wrong!'
        })
      ).rejects.toThrow('Submit icon does not exist')
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.signUpBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.signUpBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
