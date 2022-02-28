import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import {
  SignUpBlock,
  SignUpBlockCreateInput
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { SignUpBlockResolver } from './signUp.resolver'

describe('SignUpBlockResolver', () => {
  let resolver: SignUpBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const block = {
    _key: '1',
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

  const blockWithId = {
    ...block,
    id: block._key,
    _key: undefined
  }

  const blockResponse = {
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
    ...blockResponse.action,
    parentBlockId: block._key
  }

  const input: SignUpBlockCreateInput & { __typename: string } = {
    __typename: '',
    id: '1',
    parentBlockId: '',
    journeyId: '2',
    submitLabel: 'Submit',
    submitIconId: 'icon1'
  }

  const signUpBlockResponse = {
    _key: input.id,
    parentBlockId: input.parentBlockId,
    journeyId: input.journeyId,
    __typename: 'SignUpBlock',
    parentOrder: 2,
    submitLabel: input.submitLabel,
    submitIconId: 'icon1'
  }

  const blockUpdate = {
    __typename: 'SignUpBlock',
    parentBlockId: '0',
    submitIconId: 'icon2',
    submitLabel: 'Unlock Later!'
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
        SignUpBlockResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<SignUpBlockResolver>(SignUpBlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('SignUpBlock', () => {
    it('returns SignUpBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse)
      expect(await blockResolver.blocks()).toEqual([
        blockResponse,
        blockResponse
      ])
    })
  })

  describe('action', () => {
    it('returns SignUpBlock action with parentBlockId', async () => {
      expect(
        await resolver.action(blockWithId as unknown as SignUpBlock)
      ).toEqual(actionResponse)
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
      await resolver.signUpBlockUpdate(block._key, block.journeyId, blockUpdate)
      expect(service.update).toHaveBeenCalledWith(block._key, blockUpdate)
    })
  })
})
