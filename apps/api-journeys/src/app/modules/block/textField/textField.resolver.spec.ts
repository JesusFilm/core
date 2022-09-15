import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import {
  TextFieldBlock,
  TextFieldBlockCreateInput
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { TextFieldBlockResolver } from './textField.resolver'

describe('TextFieldBlockResolver', () => {
  let resolver: TextFieldBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const block = {
    id: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'TextFieldBlock',
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

  const input: TextFieldBlockCreateInput & { __typename: string } = {
    id: '1',
    journeyId: '2',
    parentBlockId: '',
    __typename: '',
    label: 'Your answer here...',
    submitLabel: 'Submit'
  }

  const textFieldBlockResponse = {
    ...input,
    __typename: 'TextFieldBlock',
    parentOrder: 2
  }

  const blockUpdate = {
    parentBlockId: '0',
    label: 'Your answer',
    content: 'My answer',
    hint: 'Enter your answer above',
    submitIconId: 'icon1',
    submitLabel: 'Next'
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
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
        TextFieldBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<TextFieldBlockResolver>(TextFieldBlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('TextFieldBlock', () => {
    it('returns TextFieldBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('action', () => {
    it('returns TextFieldBlock action with parentBlockId', async () => {
      expect(await resolver.action(block as unknown as TextFieldBlock)).toEqual(
        actionResponse
      )
    })
  })

  describe('TextFieldBlockCreate', () => {
    it('creates a TextFieldBlock', async () => {
      await resolver.textFieldBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(textFieldBlockResponse)
    })
  })

  describe('TextFieldBlockUpdate', () => {
    it('updates a TextFieldBlock', async () => {
      const mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValueOnce(true)

      await resolver.textFieldBlockUpdate(
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
        .textFieldBlockUpdate(block.id, block.journeyId, {
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
