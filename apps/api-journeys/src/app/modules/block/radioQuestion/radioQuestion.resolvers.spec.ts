import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import {
  RadioOptionBlockCreateInput,
  RadioQuestionBlockCreateInput
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import {
  RadioOptionBlockResolvers,
  RadioQuestionBlockResolvers
} from './radioQuestion.resolvers'

describe('RadioQuestion', () => {
  let blockResolver: BlockResolvers,
    radioOptionBlockResolver: RadioOptionBlockResolvers,
    radioQuestionBlockResolver: RadioQuestionBlockResolvers,
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
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const blockresponse = {
    id: '1',
    journeyId: '2',
    __typename: 'RadioOptionBlock',
    parentBlockId: '3',
    parentOrder: 3,
    label: 'label',
    description: 'description',
    action: {
      gtmEventName: 'gtmEventName',
      blockId: '4'
    }
  }

  const radioOptionInput: RadioOptionBlockCreateInput & { __typename: string } =
    {
      __typename: '',
      id: '1',
      parentBlockId: '2',
      journeyId: '3',
      label: 'label'
    }

  const radioQuestionInput: RadioQuestionBlockCreateInput & {
    __typename: string
  } = {
    __typename: '',
    id: '1',
    parentBlockId: '2',
    journeyId: '3',
    label: 'label'
  }

  const RadioOptionBlockResponse = {
    _key: radioOptionInput.id,
    journeyId: radioOptionInput.journeyId,
    __typename: 'RadioOptionBlock',
    parentBlockId: radioOptionInput.parentBlockId,
    label: 'label'
  }

  const RadioQuestionBlockResponse = {
    _key: radioQuestionInput.id,
    journeyId: radioQuestionInput.journeyId,
    __typename: 'RadioQuestionBlock',
    parentBlockId: radioQuestionInput.parentBlockId,
    label: 'label'
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
      save: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolvers,
        blockService,
        RadioQuestionBlockResolvers,
        RadioOptionBlockResolvers,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolvers>(BlockResolvers)
    radioOptionBlockResolver = module.get<RadioOptionBlockResolvers>(
      RadioOptionBlockResolvers
    )
    radioQuestionBlockResolver = module.get<RadioQuestionBlockResolvers>(
      RadioQuestionBlockResolvers
    )
    service = await module.resolve(BlockService)
  })

  describe('RadioQuestionBlock', () => {
    it('returns RadioQuestionBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockresponse)
      expect(await blockResolver.blocks()).toEqual([
        blockresponse,
        blockresponse
      ])
    })
  })

  describe('radioOptionBlockCreate', () => {
    it('creates a RadioOptionBlock', () => {
      void radioOptionBlockResolver.radioOptionBlockCreate(radioOptionInput)
      expect(service.save).toHaveBeenCalledWith(RadioOptionBlockResponse)
    })
  })

  describe('radioQuestionBlockCreate', () => {
    it('creates a RadioQuestionBlock', () => {
      void radioQuestionBlockResolver.radioQuestionBlockCreate(
        radioQuestionInput
      )
      expect(service.save).toHaveBeenCalledWith(RadioQuestionBlockResponse)
    })
  })
})
