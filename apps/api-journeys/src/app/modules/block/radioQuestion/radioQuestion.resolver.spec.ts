import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { RadioOptionBlock } from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
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
    service: BlockService

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const blockResponse = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      parentBlockId: '1',
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const radioOptionInput = {
    __typename: 'RadioOptionBlock',
    parentBlockId: '2',
    parentOrder: 2,
    journeyId: '2',
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
    journeyId: '2',
    label: 'label'
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
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
  })

  describe('RadioOptionBlock', () => {
    it('returns RadioOptionBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse)
      expect(await blockResolver.blocks()).toEqual([
        blockResponse,
        blockResponse
      ])
    })

    it('returns RadioOptionBlock action with parentBlockId', async () => {
      expect(
        await radioOptionBlockResolver.action(blockResponse as RadioOptionBlock)
      ).toEqual(block.action)
    })
  })

  describe('radioOptionBlockCreate', () => {
    it('creates a RadioOptionBlock', async () => {
      await radioOptionBlockResolver.radioOptionBlockCreate(radioOptionInput)
      expect(service.getSiblings).toHaveBeenCalledWith(
        radioOptionInput.journeyId,
        radioOptionInput.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(radioOptionInput)
    })
  })

  describe('radioQuestionBlockCreate', () => {
    it('creates a RadioQuestionBlock', async () => {
      await resolver.radioQuestionBlockCreate(radioQuestionInput)
      expect(service.getSiblings).toHaveBeenCalledWith(
        radioQuestionInput.journeyId,
        radioQuestionInput.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(radioQuestionInput)
    })
  })

  describe('radioOptionBlockUpdate', () => {
    it('updates a RadioOptionBlock', async () => {
      await radioOptionBlockResolver.radioOptionBlockUpdate(
        block._key,
        block.journeyId,
        radioOptionUpdate
      )
      expect(service.update).toHaveBeenCalledWith(block._key, radioOptionUpdate)
    })
  })

  describe('radioQuestionBlockUpdate', () => {
    it('updates a RadioQuestionBlock', async () => {
      await resolver.radioQuestionBlockUpdate(
        block._key,
        block.journeyId,
        radioQuestionInput
      )
      expect(service.update).toHaveBeenCalledWith(
        block._key,
        radioQuestionInput
      )
    })
  })
})
