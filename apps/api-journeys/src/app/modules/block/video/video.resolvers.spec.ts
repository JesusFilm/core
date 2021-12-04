

import { Test, TestingModule } from '@nestjs/testing'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'

describe('VideoContentResolvers', () => {
  let resolver: BlockResolvers

  const block1 = {
    _key: "1",
    journeyId: "2",
    type: 'VideoBlock',
    parentBlockId: "3",
    parentOrder: 1,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const block1response = {
    id: "1",
    journeyId: "2",
    type: 'VideoBlock',
    parentBlockId: "3",
    parentOrder: 1,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529',
      src:"https://arc.gt/hls/2_0-FallingPlates/529"
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const block2 = {
    _key: "1",
    journeyId: "2",
    type: 'VideoBlock',
    parentBlockId: "3",
    parentOrder: 1,
    videoContent: {
      src: "https://arc.gt/hls/2_0-FallingPlates/529"
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const block2response = {
    id: "1",
    journeyId: "2",
    type: 'VideoBlock',
    parentBlockId: "3",
    parentOrder: 1,
    videoContent: {
      src: "https://arc.gt/hls/2_0-FallingPlates/529"
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  describe('VideoBlock Arclight', () => {
    beforeEach(async () => {
      const blockservice = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block1)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [BlockResolvers, blockservice]
      }).compile()
      resolver = module.get<BlockResolvers>(BlockResolvers)
    })
    it('returns VideoBlock with Arclight', async () => {
      expect(await resolver.block("1")).toEqual(block1response)
    })
  })

  describe('VideoBlock', () => {
    beforeEach(async () => {
      const blockservice = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block2)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [BlockResolvers, blockservice]
      }).compile()
      resolver = module.get<BlockResolvers>(BlockResolvers)
    })
    it('returns VideoBlock', async () => {
      expect(await resolver.block("1")).toEqual(block2response)
    })
  })  
})
