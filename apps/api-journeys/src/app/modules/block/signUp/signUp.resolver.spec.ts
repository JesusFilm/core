import { Test, TestingModule } from '@nestjs/testing'

import {
  SignUpBlock,
  SignUpBlockCreateInput
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { SignUpBlockResolver } from './signUp.resolver'

describe('SignUpBlockResolver', () => {
  let resolver: SignUpBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService,
    prismaService: PrismaService

  const block = {
    id: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'SignUpBlock',
    parentOrder: 1,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '2'
    },
    submitIconId: 'icon1',
    submitLabel: 'Unlock Now!'
  }

  const actionResponse = {
    ...block.action,
    parentBlockId: block.id
  }

  const input: SignUpBlockCreateInput = {
    id: '1',
    parentBlockId: '',
    journeyId: '2',
    submitLabel: 'Submit'
  }

  const signUpBlockResponse = {
    id: input.id,
    parentBlockId: input.parentBlockId,
    journey: {
      connect: { id: input.journeyId }
    },
    journeyId: input.journeyId,
    typename: 'SignUpBlock',
    parentOrder: 2,
    submitLabel: input.submitLabel
  }

  const blockUpdate = {
    __typename: 'SignUpBlock',
    parentBlockId: '0',
    submitIconId: 'icon1',
    submitLabel: 'Unlock Later!'
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      getSiblings: jest.fn(() => [block, block]),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input),
      validateBlock: jest.fn()
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        SignUpBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<SignUpBlockResolver>(SignUpBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = await module.resolve(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValueOnce(block)
    prismaService.block.findMany = jest
      .fn()
      .mockResolvedValueOnce([block, block])
  })

  describe('SignUpBlock', () => {
    it('returns SignUpBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('action', () => {
    it('returns SignUpBlock action with parentBlockId', async () => {
      expect(await resolver.action(block as unknown as SignUpBlock)).toEqual(
        actionResponse
      )
    })
  })

  describe('SignUpBlockCreate', () => {
    it('creates a SignUpBlock', async () => {
      await resolver.signUpBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(signUpBlockResponse)
    })
  })

  describe('SignUpBlockUpdate', () => {
    it('updates a SignUpBlock', async () => {
      const mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValueOnce(true)

      await resolver.signUpBlockUpdate(block.id, block.journeyId, blockUpdate)
      expect(service.update).toHaveBeenCalledWith(block.id, blockUpdate)
    })

    it('should throw error with an invalid submitIconId', async () => {
      const mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValueOnce(false)

      await resolver
        .signUpBlockUpdate(block.id, block.journeyId, {
          ...blockUpdate,
          submitIconId: 'wrong!'
        })
        .catch((error) => {
          expect(error.message).toEqual('Submit icon does not exist')
        })
      expect(service.update).not.toHaveBeenCalled()
    })
  })
})
