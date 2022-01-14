import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import { StepBlockResolvers } from './step.resolvers'

describe('Step', () => {
  let blockResolver: BlockResolvers,
    stepBlockResolver: StepBlockResolvers,
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
    parentOrder: 0,
    locked: true,
    nextBlockId: '4'
  }

  const blockresponse = {
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
      save: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolvers,
        blockService,
        StepBlockResolvers,
        UserJourneyService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()
    blockResolver = module.get<BlockResolvers>(BlockResolvers)
    stepBlockResolver = module.get<StepBlockResolvers>(StepBlockResolvers)
    service = await module.resolve(BlockService)
  })

  describe('StepBlock', () => {
    it('returns StepBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockresponse)
      expect(await blockResolver.blocks()).toEqual([
        blockresponse,
        blockresponse
      ])
    })
  })

  describe('stepBlockCreate', () => {
    it('creates a StepBlock', async () => {
      stepBlockResolver
        .stepBlockCreate(blockUpdate)
        .catch((err) => console.log(err))
      expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
    })
  })

  describe('stepBlockUpdate', () => {
    it('updates a StepBlock', async () => {
      stepBlockResolver
        .stepBlockUpdate(block._key, block.journeyId, blockUpdate)
        .catch((err) => console.log(err))
      expect(service.update).toHaveBeenCalledWith(block._key, blockUpdate)
    })
  })
})
