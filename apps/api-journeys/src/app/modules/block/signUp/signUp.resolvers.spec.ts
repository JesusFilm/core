import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { SignUpBlockCreateInput } from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import { SignUpBlockResolvers } from './signUp.resolvers'

describe('SignUp', () => {
  let blockResolver: BlockResolvers,
    signUpResolver: SignUpBlockResolvers,
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
      name: 'LockOpenRounded',
      color: 'secondary',
      size: 'lg'
    },
    submitLabel: 'Unlock Now!'
  }
  const blockresponse = {
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
      name: 'LockOpenRounded',
      color: 'secondary',
      size: 'lg'
    },
    submitLabel: 'Unlock Now!'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolvers,
        blockService,
        SignUpBlockResolvers,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolvers>(BlockResolvers)
    signUpResolver = module.get<SignUpBlockResolvers>(SignUpBlockResolvers)
    service = await module.resolve(BlockService)
  })

  describe('SignUpBlock', () => {
    it('returns SignUpBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockresponse)
      expect(await blockResolver.blocks()).toEqual([
        blockresponse,
        blockresponse
      ])
    })
  })

  describe('SignUpBlockCreate', () => {
    it('creates a SignUpBlock', async () => {
      await signUpResolver.signUpBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(signUpBlockResponse)
    })
  })

  describe('SignUpBlockUpdate', () => {
    it('updates a SignUpBlock', async () => {
      await signUpResolver.signUpBlockUpdate(block._key, block.journeyId, block)
      expect(service.update).toHaveBeenCalledWith(
        block._key,
        blockupdateresponse
      )
    })
  })
})
