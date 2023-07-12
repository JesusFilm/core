import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import omit from 'lodash/omit'

import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { StepBlock } from '../../../__generated__/graphql'
import { UserRoleService } from '../../userRole/userRole.service'
import { JourneyService } from '../../journey/journey.service'
import { PrismaService } from '../../../lib/prisma.service'
import { StepBlockResolver } from './step.resolver'

describe('StepBlockResolver', () => {
  let resolver: StepBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const block = {
    id: '1',
    journeyId: '2',
    __typename: 'StepBlock',
    parentBlockId: '3',
    parentOrder: 0,
    locked: true,
    nextBlockId: '4'
  }

  const blockUpdate = omit(block, 'id')

  const blockCreateResponse = {
    ...block,
    parentOrder: 2
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      getAll: jest.fn(() => [block, block]),
      getSiblings: jest.fn(() => [block, block]),
      save: jest.fn(() => blockCreateResponse),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        StepBlockResolver,
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
    resolver = module.get<StepBlockResolver>(StepBlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('StepBlock', () => {
    it('returns StepBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block)
      expect(await blockResolver.blocks()).toEqual([block, block])
    })
  })

  describe('stepBlockCreate', () => {
    it('creates a StepBlock', async () => {
      expect(
        await resolver.stepBlockCreate(omit(block, ['id', 'parentOrder']))
      ).toEqual(blockCreateResponse)
      expect(service.getSiblings).toHaveBeenCalledWith(block.journeyId)
      expect(service.save).toHaveBeenCalledWith({
        ...blockUpdate,
        parentOrder: 2
      })
    })
  })

  describe('stepBlockUpdate', () => {
    it('updates a StepBlock', async () => {
      await resolver.stepBlockUpdate(block.id, block.journeyId, blockUpdate)
      expect(service.update).toHaveBeenCalledWith(block.id, blockUpdate)
    })
  })

  describe('locked', () => {
    it('returns locked when true', () => {
      expect(resolver.locked({ locked: true } as unknown as StepBlock)).toEqual(
        true
      )
    })

    it('returns locked when false', () => {
      expect(
        resolver.locked({ locked: false } as unknown as StepBlock)
      ).toEqual(false)
    })

    it('returns false when locked is not set', () => {
      expect(resolver.locked({} as unknown as StepBlock)).toEqual(false)
    })
  })
})
