import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import { RadioOptionBlock } from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import {
  RadioOptionBlockResolver,
  RadioQuestionBlockResolver
} from './radioQuestion.resolver'

describe('RadioQuestionBlockResolver', () => {
  let resolver: RadioQuestionBlockResolver,
    blockResolver: BlockResolver,
    radioOptionBlockResolver: RadioOptionBlockResolver,
    service: BlockService,
    prismaService: PrismaService

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    action: {
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const actionResponse = {
    ...block.action,
    parentBlockId: block.id
  }

  const radioOptionInput = {
    __typename: 'RadioOptionBlock',
    parentBlockId: '2',
    parentOrder: 2,
    journeyId: '2',
    label: 'label'
  }

  const radioOptionResponse = {
    typename: 'RadioOptionBlock',
    parentBlockId: '2',
    parentOrder: 2,
    journey: {
      connect: { id: '2' }
    },
    label: 'label'
  }

  const radioOptionUpdate = {
    __typename: 'RadioOptionBlock',
    parentBlockId: '2',
    parentOrder: 1,
    journeyId: '2',
    label: 'label',
    action: {
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const radioQuestionInput = {
    __typename: 'RadioQuestionBlock',
    parentBlockId: '2',
    parentOrder: 2,
    journeyId: '2'
  }

  const radioQuestionResponse = {
    typename: 'RadioQuestionBlock',
    parentBlockId: '2',
    parentOrder: 2,
    journey: { connect: { id: '2' } }
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      getSiblings: jest.fn(() => [block, block]),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        RadioQuestionBlockResolver,
        RadioOptionBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        PrismaService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    radioOptionBlockResolver = module.get<RadioOptionBlockResolver>(
      RadioOptionBlockResolver
    )
    resolver = module.get<RadioQuestionBlockResolver>(
      RadioQuestionBlockResolver
    )
    service = await module.resolve(BlockService)
    prismaService = await module.resolve(PrismaService)
    prismaService.block.findUnique = jest.fn().mockResolvedValueOnce(block)
    prismaService.block.findMany = jest
      .fn()
      .mockResolvedValueOnce([block, block])
  })

  describe('RadioOptionBlock', () => {
    it('returns RadioOptionBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('action', () => {
    it('returns RadioOptionBlock action with parentBlockId', async () => {
      expect(
        await radioOptionBlockResolver.action(
          block as unknown as RadioOptionBlock
        )
      ).toEqual(actionResponse)
    })
  })

  describe('radioOptionBlockCreate', () => {
    it('creates a RadioOptionBlock', async () => {
      await radioOptionBlockResolver.radioOptionBlockCreate(radioOptionInput)
      expect(service.getSiblings).toHaveBeenCalledWith(
        radioOptionInput.journeyId,
        radioOptionInput.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(radioOptionResponse)
    })
  })

  describe('radioQuestionBlockCreate', () => {
    it('creates a RadioQuestionBlock', async () => {
      await resolver.radioQuestionBlockCreate(radioQuestionInput)
      expect(service.getSiblings).toHaveBeenCalledWith(
        radioQuestionInput.journeyId,
        radioQuestionInput.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(radioQuestionResponse)
    })
  })

  describe('radioOptionBlockUpdate', () => {
    it('updates a RadioOptionBlock', async () => {
      await radioOptionBlockResolver.radioOptionBlockUpdate(
        block.id,
        block.journeyId,
        radioOptionUpdate
      )
      expect(service.update).toHaveBeenCalledWith(block.id, radioOptionUpdate)
    })
  })

  describe('radioQuestionBlockUpdate', () => {
    it('updates a RadioQuestionBlock', async () => {
      await resolver.radioQuestionBlockUpdate(
        block.id,
        block.journeyId,
        block.parentBlockId
      )
      expect(service.update).toHaveBeenCalledWith(block.id, {
        parentBlockId: block.parentBlockId
      })
    })
  })
})
