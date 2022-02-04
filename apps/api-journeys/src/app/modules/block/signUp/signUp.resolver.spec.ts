import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import {
  IconName,
  IconColor,
  IconSize,
  SignUpBlockCreateInput
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { SignUpBlockResolver } from './signUp.resolver'

describe('SignUp', () => {
  let blockResolver: BlockResolver,
    resolver: SignUpBlockResolver,
    service: BlockService

  const block = {
    _key: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'SignUpBlock',
    parentOrder: 2,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '2'
    },
    submitIcon: {
      name: IconName.LockOpenRounded,
      color: IconColor.secondary,
      size: IconSize.lg
    },
    submitLabel: 'Unlock Now!'
  }
  const blockResponse = {
    id: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'SignUpBlock',
    parentOrder: 2,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '2'
    },
    submitIcon: {
      name: 'LockOpenRounded',
      color: 'secondary',
      size: 'lg'
    },
    submitLabel: 'Unlock Now!'
  }

  const input: SignUpBlockCreateInput & { __typename: string } = {
    __typename: '',
    id: '1',
    parentBlockId: '0',
    journeyId: '2',
    submitLabel: 'Submit'
  }

  const signUpBlockResponse = {
    _key: input.id,
    parentBlockId: input.parentBlockId,
    journeyId: input.journeyId,
    __typename: 'SignUpBlock',
    parentOrder: 1,
    submitLabel: input.submitLabel
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
      getSiblings: jest.fn(() => [block]),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  const blockupdateresponse = {
    _key: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'SignUpBlock',
    parentOrder: 2,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '2'
    },
    submitIcon: {
      name: IconName.LockOpenRounded,
      color: IconColor.secondary,
      size: IconSize.lg
    },
    submitLabel: 'Unlock Now!'
  }

  const blockWithNoIcon = {
    _key: '1',
    journeyId: '2',
    parentBlockId: '0',
    __typename: 'SignUpBlock',
    parentOrder: 2,
    action: {
      gtmEventName: 'gtmEventName',
      journeyId: '2'
    },
    submitIcon: null,
    submitLabel: 'Unlock Now!'
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

  describe('SignUpBlockCreate', () => {
    it('creates a SignUpBlock', async () => {
      await resolver.signUpBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(signUpBlockResponse)
    })
  })

  describe('SignUpBlockUpdate', () => {
    it('updates a SignUpBlock', async () => {
      await resolver.signUpBlockUpdate(block._key, block.journeyId, block)
      expect(service.update).toHaveBeenCalledWith(
        block._key,
        blockupdateresponse
      )
    })

    it('removes the icon from sign up block', async () => {
      await resolver.signUpBlockUpdate(block._key, block.journeyId, {
        ...block,
        submitIcon: null
      })
      expect(service.update).toHaveBeenCalledWith(block._key, blockWithNoIcon)
    })
  })
})
