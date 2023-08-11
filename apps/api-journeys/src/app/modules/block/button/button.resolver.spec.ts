import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import {
  ButtonBlockCreateInput,
  ButtonBlockUpdateInput,
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { ButtonBlockResolver } from './button.resolver'

describe('ButtonBlock', () => {
  let resolver: ButtonBlockResolver,
    service: BlockService,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    typename: 'ButtonBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 1,
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.large
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: ButtonBlockCreateInput = {
    id: 'blockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.medium
  }
  const blockUpdateInput: ButtonBlockUpdateInput = {
    parentBlockId: 'parentBlockId',
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.small,
    startIconId: 'start1',
    endIconId: 'end1'
  }
  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      getSiblings: jest.fn(() => [block, block]),
      update: jest.fn((input) => input),
      validateBlock: jest.fn()
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        blockService,
        ButtonBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<ButtonBlockResolver>(ButtonBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('buttonBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a ButtonBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.buttonBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          color: 'primary',
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          label: 'label',
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: 2,
          size: 'medium',
          typename: 'ButtonBlock',
          variant: 'contained'
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

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.buttonBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })
  })

  describe('buttonBlockUpdate', () => {
    let mockValidate: jest.MockedFunction<typeof service.validateBlock>

    beforeEach(() => {
      mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValue(true)
    })

    it('updates a ButtonBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.buttonBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throws error if startIconId does not exist', async () => {
      mockValidate.mockResolvedValueOnce(false)
      await expect(
        resolver.buttonBlockUpdate(ability, 'blockId', {
          ...blockUpdateInput,
          startIconId: 'wrong!'
        })
      ).rejects.toThrow('Start icon does not exist')
    })

    it('throws error if endIconId does not exist', async () => {
      mockValidate.mockResolvedValueOnce(true)
      mockValidate.mockResolvedValueOnce(false)
      await expect(
        resolver.buttonBlockUpdate(ability, 'blockId', {
          ...blockUpdateInput,
          endIconId: 'wrong!'
        })
      ).rejects.toThrow('End icon does not exist')
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.buttonBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.buttonBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})
