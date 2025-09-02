import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey } from '@core/prisma/journeys/client'

import { UserTeamRole } from '../../__generated__/graphql'
import {} from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'

import { ActionService } from './action.service'

describe('ActionService', () => {
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

  const block = {
    id: '1',
    journeyId: '2',
    typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }

  let service: ActionService,
    blockService: DeepMockProxy<BlockService>,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ActionService,
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    service = module.get<ActionService>(ActionService)
    blockService = module.get<BlockService>(
      BlockService
    ) as DeepMockProxy<BlockService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('emailActionUpdate', () => {
    it('should upsert email action', async () => {
      await service.emailActionUpdate('id', blockWithUserTeam, {
        gtmEventName: null,
        email: 'mycuteemail@hi.com'
      })
      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        create: {
          email: 'mycuteemail@hi.com',
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } }
        },
        include: { parentBlock: { include: { action: true } } },
        update: {
          block: { disconnect: true },
          email: 'mycuteemail@hi.com',
          gtmEventName: null,
          journey: { disconnect: true },
          target: null,
          url: null,
          phone: null
        },
        where: { parentBlockId: 'id' }
      })
    })

    it('should validate the email address', async () => {
      await expect(
        service.emailActionUpdate('id', blockWithUserTeam, {
          gtmEventName: null,
          email: 'notaRealEmail.com'
        })
      ).rejects.toThrow('must be a valid email')
    })
  })

  describe('navigateToBlockActionUpdate', () => {
    it('should upsert navigate to block action', async () => {
      await service.navigateToBlockActionUpdate('id', blockWithUserTeam, {
        gtmEventName: null,
        blockId: 'mycuteemail@hi.com'
      })
      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        create: {
          block: { connect: { id: 'mycuteemail@hi.com' } },
          gtmEventName: null,
          parentBlock: { connect: { id: '1' } }
        },
        include: { parentBlock: { include: { action: true } } },
        update: {
          block: { connect: { id: 'mycuteemail@hi.com' } },
          email: null,
          gtmEventName: null,
          journey: { disconnect: true },
          target: null,
          url: null,
          phone: null
        },
        where: { parentBlockId: 'id' }
      })
    })

    it('throws an error if user input block id matches parent step block id', async () => {
      const wrongInput = {
        gtmEventName: 'gtmEventName',
        blockId: stepBlock.id
      }
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      blockService.findParentStepBlock.mockResolvedValueOnce(stepBlock)

      await expect(
        service.navigateToBlockActionUpdate('id', blockWithUserTeam, wrongInput)
      ).rejects.toThrow('blockId cannot be the parent step block id')
    })
  })

  describe('linkActionUpdate', () => {
    it('should upsert navigate to block action', async () => {
      await service.linkActionUpdate('id', blockWithUserTeam, {
        gtmEventName: 'gtmEventName',
        url: 'mycuteemail@hi.com',
        target: undefined
      })
      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        create: {
          gtmEventName: 'gtmEventName',
          parentBlock: { connect: { id: '1' } },
          target: undefined,
          url: 'mycuteemail@hi.com'
        },
        include: { parentBlock: { include: { action: true } } },
        update: {
          block: { disconnect: true },
          email: null,
          gtmEventName: 'gtmEventName',
          journey: { disconnect: true },
          target: undefined,
          url: 'mycuteemail@hi.com',
          phone: null
        },
        where: { parentBlockId: 'id' }
      })
    })
  })

  describe('phoneActionUpdate', () => {
    it('should upsert phone action', async () => {
      await service.phoneActionUpdate('id', blockWithUserTeam, {
        gtmEventName: 'gtmEventName',
        phone: '1234567890',
        countryCode: 'US'
      })
      expect(prismaService.action.upsert).toHaveBeenCalledWith({
        create: {
          phone: '1234567890',
          countryCode: 'US',
          gtmEventName: 'gtmEventName',
          parentBlock: { connect: { id: '1' } }
        },
        include: { parentBlock: { include: { action: true } } },
        update: {
          block: { disconnect: true },
          email: null,
          gtmEventName: 'gtmEventName',
          journey: { disconnect: true },
          target: null,
          url: null,
          phone: '1234567890',
          countryCode: 'US'
        },
        where: { parentBlockId: 'id' }
      })
    })

    it('should throw an error if the phone number is not valid', async () => {
      await expect(
        service.phoneActionUpdate('id', blockWithUserTeam, {
          gtmEventName: 'gtmEventName',
          phone: 'not a phone number',
          countryCode: 'US'
        })
      ).rejects.toThrow('must be a valid phone number')
    })
  })
})
