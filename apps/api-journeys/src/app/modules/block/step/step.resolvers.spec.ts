
   
import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import { StepBlockResolvers } from './step.resolvers'

describe('Step', () => {
  let blockResolver: BlockResolvers, stepBlockResolver: StepBlockResolvers, service: BlockService

  const block = {
    _key: "1",
    journeyId: "2",
    type: 'StepBlock',
    parentBlockId: "3",
    parentOrder: 0,
    locked: true,
    nextBlockId: "4"
  }

  const blockUpdate = {
    journeyId: "2",
    parentBlockId: "3",
    parentOrder: 0,
    locked: true,
    nextBlockId: "4"
  }

  const blockCreateResponse = {
    journeyId: "2",
    type: 'StepBlock',
    parentBlockId: "3",
    parentOrder: 0,
    locked: true,
    nextBlockId: "4"
  }


  const blockresponse = {
    id: "1",
    journeyId: "2",
    type: 'StepBlock',
    parentBlockId: "3",
    parentOrder: 0,
    locked: true,
    nextBlockId: "4"
  }
  
  const blockservice = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() =>  block),
      getAll: jest.fn(() => [block, block]),
      save: jest.fn(input => input),
      update: jest.fn(input => input)
    })
  }

 
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockResolvers, blockservice, StepBlockResolvers]
    }).compile()
    blockResolver = module.get<BlockResolvers>(BlockResolvers)
    stepBlockResolver = module.get<StepBlockResolvers>(StepBlockResolvers)
    service = await module.resolve(BlockService)
  })

  it('should be defined', () => {
    expect(blockResolver).toBeDefined()
  })

  describe('StepBlock', () => {
    it('returns StepBlock', async () => {
      expect(blockResolver.block("1")).resolves.toEqual(blockresponse)
      expect(blockResolver.blocks()).resolves.toEqual([blockresponse, blockresponse])
    })
  })

  describe('stepBlockCreate', () => {
    it('creates a StepBlock', async () => {
      stepBlockResolver.stepBlockCreate(blockUpdate)
      expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
    })
  })

  describe('stepBlockUpdate', () => {
    it('updates a StepBlock', async () => {
      stepBlockResolver.stepBlockUpdate(block._key, blockUpdate)
      expect(service.update).toHaveBeenCalledWith(block._key, blockUpdate)
    })
  })
})
