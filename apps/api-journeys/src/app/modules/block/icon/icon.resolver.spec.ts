import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import {
  IconBlockCreateInput,
  IconColor,
  IconName,
  IconSize
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { IconBlockResolver } from './icon.resolver'

describe('Icon', () => {
  let resolver: BlockResolver,
    iconBlockResolver: IconBlockResolver,
    service: BlockService

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'IconBlock',
    parentBlockId: '0',
    parentOrder: 0,
    name: 'ArrowForwardRounded',
    color: 'secondary',
    size: 'lg'
  }

  const input: IconBlockCreateInput & { __typename: string } = {
    __typename: 'IconBlock',
    id: '1',
    parentBlockId: '0',
    journeyId: '2',
    name: IconName.ArrowForwardRounded,
    color: IconColor.secondary,
    size: IconSize.lg
  }

  const create = {
    ...block,
    parentOrder: null
  }

  const inputUpdate = {
    journeyId: '2',
    parentBlockId: '0',
    name: IconName.PlayArrowRounded,
    color: IconColor.primary,
    size: IconSize.sm
  }

  const updateResponse = {
    journeyId: '2',
    parentBlockId: '0',
    name: 'PlayArrowRounded',
    color: 'primary',
    size: 'sm'
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        IconBlockResolver,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    resolver = module.get<BlockResolver>(BlockResolver)
    iconBlockResolver = module.get<IconBlockResolver>(IconBlockResolver)
    resolver = module.get<BlockResolver>(BlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('IconBlock', () => {
    it('returns IconBlock', async () => {
      expect(await resolver.block('1')).toEqual(block)
      expect(await resolver.blocks()).toEqual([block, block])
    })
  })

  describe('IconBlockCreate', () => {
    it('creates an IconBlock', async () => {
      await iconBlockResolver.iconBlockCreate(input)
      expect(service.save).toHaveBeenCalledWith(create)
    })
  })

  describe('IconBlockUpdate', () => {
    it('updates a IconBlock', async () => {
      void iconBlockResolver.iconBlockUpdate(
        block.id,
        block.journeyId,
        inputUpdate
      )
      expect(service.update).toHaveBeenCalledWith(block.id, updateResponse)
    })
  })
})
