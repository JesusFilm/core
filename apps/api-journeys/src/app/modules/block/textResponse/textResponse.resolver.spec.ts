import { Test, TestingModule } from '@nestjs/testing'
import { omit } from 'lodash'

import {
  TextResponseBlock,
  TextResponseBlockCreateInput
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { TextResponseBlockResolver } from './textResponse.resolver'

describe('TextResponseBlockResolver', () => {
  let resolver: TextResponseBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService,
    prismaService: PrismaService

  const block = {
    id: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'TextResponseBlock',
    parentOrder: 1,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '2'
    },
    submitIconId: 'icon1',
    submitLabel: 'Submit'
  }

  const actionResponse = {
    ...block.action,
    parentBlockId: block.id
  }

  const input: TextResponseBlockCreateInput = {
    id: '1',
    journeyId: '2',
    parentBlockId: '',
    label: 'Your answer here...',
    submitLabel: 'Submit'
  }

  const textResponseBlockResponse = {
    ...omit(input, ['__typename', 'journeyId']),
    typename: 'TextResponseBlock',
    parentOrder: 2,
    journey: { connect: { id: '2' } },
    journeyId: '2'
  }

  const blockUpdate = {
    parentBlockId: '0',
    label: 'Your answer',
    hint: 'Enter your answer above',
    submitIconId: 'icon1',
    submitLabel: 'Next'
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
        TextResponseBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<TextResponseBlockResolver>(TextResponseBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValueOnce(block)
    prismaService.block.findMany = jest
      .fn()
      .mockResolvedValueOnce([block, block])
  })

  describe('TextResponseBlock', () => {
    it('returns TextResponseBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('action', () => {
    it('returns TextResponseBlock action with parentBlockId', async () => {
      expect(
        await resolver.action(block as unknown as TextResponseBlock)
      ).toEqual(actionResponse)
    })
  })

  describe('TextResponseBlockCreate', () => {
    it('creates a TextResponseBlock', async () => {
      await resolver.textResponseBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(textResponseBlockResponse)
    })
  })

  describe('TextResponseBlockUpdate', () => {
    it('updates a TextResponseBlock', async () => {
      const mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValueOnce(true)

      await resolver.textResponseBlockUpdate(
        block.id,
        block.journeyId,
        blockUpdate
      )
      expect(service.update).toHaveBeenCalledWith(block.id, blockUpdate)
    })

    it('should throw error with an invalid submitIconId', async () => {
      const mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValueOnce(false)

      await resolver
        .textResponseBlockUpdate(block.id, block.journeyId, {
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
