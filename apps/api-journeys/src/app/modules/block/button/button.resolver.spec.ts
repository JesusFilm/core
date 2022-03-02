import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import {
  ButtonBlockCreateInput,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  ButtonBlock
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { ButtonBlockResolver } from './button.resolver'

describe('Button', () => {
  let resolver: ButtonBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'ButtonBlock',
    parentBlockId: '0',
    parentOrder: 1,
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: 'start1',
    endIconId: 'end1',
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
  }

  const blockWithId = {
    ...block,
    id: block._key,
    _key: undefined
  }

  const blockResponse = {
    id: '1',
    journeyId: '2',
    __typename: 'ButtonBlock',
    parentBlockId: '0',
    parentOrder: 1,
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: 'start1',
    endIconId: 'end1',
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
  }

  const actionResponse = {
    ...blockResponse.action,
    parentBlockId: block._key
  }

  const blockInput: ButtonBlockCreateInput & { __typename: string } = {
    id: '1',
    journeyId: '2',
    __typename: 'ButtonBlock',
    parentBlockId: '0',
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.medium
  }

  const blockCreateResponse = {
    _key: '1',
    journeyId: '2',
    __typename: 'ButtonBlock',
    parentBlockId: '0',
    parentOrder: 2,
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.medium
  }

  const blockUpdate = {
    __typename: '',
    journeyId: '2',
    parentBlockId: '0',
    parentOrder: 1,
    label: 'label',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.small,
    startIconId: 'start1',
    endIconId: 'end1',
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
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
        ButtonBlockResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<ButtonBlockResolver>(ButtonBlockResolver)
    blockResolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('ButtonBlock', () => {
    it('returns ButtonBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse)
      expect(await blockResolver.blocks()).toEqual([
        blockResponse,
        blockResponse
      ])
    })
  })

  describe('action', () => {
    it('returns ButtonBlock action with parentBlockId', async () => {
      expect(
        await resolver.action(blockWithId as unknown as ButtonBlock)
      ).toEqual(actionResponse)
    })
  })

  describe('ButtonBlockCreate', () => {
    it('creates a ButtonBlock', async () => {
      await resolver.buttonBlockCreate(blockInput)
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockInput.journeyId,
        blockInput.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
    })
  })

  describe('ButtonBlockUpdate', () => {
    it('updates a ButtonBlock', async () => {
      const mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValueOnce(true)
      mockValidate.mockResolvedValueOnce(true)

      await resolver.buttonBlockUpdate(block._key, block.journeyId, blockUpdate)
      expect(service.update).toHaveBeenCalledWith(block._key, blockUpdate)
    })

    it('should throw error with an invalid startIconId', async () => {
      const mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValueOnce(false)
      mockValidate.mockResolvedValueOnce(true)

      await resolver
        .buttonBlockUpdate(block._key, block.journeyId, {
          ...blockUpdate,
          startIconId: 'wrong!'
        })
        .catch((error) => {
          expect(error.message).toEqual('Start icon does not exist')
        })
      expect(service.update).not.toHaveBeenCalled()
    })

    it('should throw error with an invalid endIconId', async () => {
      const mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValueOnce(true)
      mockValidate.mockResolvedValueOnce(false)

      await resolver
        .buttonBlockUpdate(block._key, block.journeyId, {
          ...blockUpdate,
          endIconId: 'wrong!'
        })
        .catch((error) => {
          expect(error.message).toEqual('End icon does not exist')
        })
      expect(service.update).not.toHaveBeenCalled()
    })
  })
})
