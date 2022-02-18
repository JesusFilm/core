import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { StepBlock } from '../../../__generated__/graphql'
import { StepBlockResolver } from './step.resolver'

describe('StepBlockResolver', () => {
  let resolver: StepBlockResolver,
    blockResolver: BlockResolver,
    service: BlockService

  const block = {
    _key: '1',
    journeyId: '2',
    __typename: 'StepBlock',
    parentBlockId: '3',
    parentOrder: 0,
    locked: true,
    nextBlockId: '4'
  }

  const blockUpdate = {
    __typename: '',
    journeyId: '2',
    parentBlockId: '3',
    parentOrder: 0,
    locked: true,
    nextBlockId: '4'
  }

  const blockCreateResponse = {
    journeyId: '2',
    __typename: 'StepBlock',
    parentBlockId: '3',
    parentOrder: 2,
    locked: true,
    nextBlockId: '4'
  }

  const blockResponse = {
    id: '1',
    journeyId: '2',
    __typename: 'StepBlock',
    parentBlockId: '3',
    parentOrder: 0,
    locked: true,
    nextBlockId: '4'
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
        StepBlockResolver,
        UserJourneyService,
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
      expect(await blockResolver.block('1')).toEqual(blockResponse)
      expect(await blockResolver.blocks()).toEqual([
        blockResponse,
        blockResponse
      ])
    })
  })

  describe('stepBlockCreate', () => {
    it('creates a StepBlock', async () => {
      await resolver
        .stepBlockCreate(blockUpdate)
        .catch((err) => console.log(err))
      expect(service.getSiblings).toHaveBeenCalledWith(blockUpdate.journeyId)
      expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
    })
  })

  describe('stepBlockUpdate', () => {
    it('updates a StepBlock', async () => {
      resolver
        .stepBlockUpdate(block._key, block.journeyId, blockUpdate)
        .catch((err) => console.log(err))
      expect(service.update).toHaveBeenCalledWith(block._key, blockUpdate)
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
