import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { MemberService } from '../../member/member.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { TypographyBlockResolver } from './typography.resolver'

describe('TypographyBlockResolver', () => {
  let resolver: TypographyBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'TypographyBlock',
    parentBlockId: '3',
    parentOrder: 7,
    content: 'text',
    variant: TypographyVariant.h2,
    color: TypographyColor.primary,
    align: TypographyAlign.left
  }

  const blockUpdate = {
    __typename: '',
    journeyId: '2',
    parentBlockId: '3',
    parentOrder: 1,
    content: 'text',
    variant: TypographyVariant.h2,
    color: TypographyColor.primary,
    align: TypographyAlign.left
  }

  const blockCreateResponse = {
    journeyId: '2',
    __typename: 'TypographyBlock',
    parentBlockId: '3',
    parentOrder: 2,
    content: 'text',
    variant: TypographyVariant.h2,
    color: TypographyColor.primary,
    align: TypographyAlign.left
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
        TypographyBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
        MemberService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolver>(BlockResolver)
    resolver = module.get<TypographyBlockResolver>(TypographyBlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('TypographyBlock', () => {
    it('returns TypographyBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('typographyBlockCreate', () => {
    it('creates a TypographyBlock', async () => {
      await resolver.typographyBlockCreate(blockUpdate)
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockUpdate.journeyId,
        blockUpdate.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
    })
  })

  describe('typographyBlockUpdate', () => {
    it('updates a TypographyBlock', async () => {
      void resolver.typographyBlockUpdate(
        block.id,
        block.journeyId,
        blockUpdate
      )
      expect(service.update).toHaveBeenCalledWith(block.id, blockUpdate)
    })
  })
})
