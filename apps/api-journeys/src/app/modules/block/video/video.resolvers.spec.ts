import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolvers } from '../block.resolvers'
import { BlockService } from '../block.service'
import { VideoBlockResolvers, VideoArclightResolvers } from './video.resolvers'

describe('VideoContentResolvers', () => {
  let blockResolver: BlockResolvers,
    videoBlockResolver: VideoBlockResolvers,
    videoArclightResolvers: VideoArclightResolvers,
    service: BlockService

  const block1 = {
    _key: '1',
    journeyId: '2',
    __typename: 'VideoBlock',
    parentBlockId: '3',
    parentOrder: 1,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529',
      src: ''
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const blockUpdate = {
    __typename: '',
    journeyId: '2',
    parentBlockId: '3',
    parentOrder: 1,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const blockCreateResponse = {
    journeyId: '2',
    __typename: 'VideoBlock',
    parentBlockId: '3',
    parentOrder: 1,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const block1response = {
    id: '1',
    journeyId: '2',
    __typename: 'VideoBlock',
    parentBlockId: '3',
    parentOrder: 1,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529',
      src: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const block2 = {
    _key: '1',
    journeyId: '2',
    __typename: 'VideoBlock',
    parentBlockId: '3',
    parentOrder: 1,
    videoContent: {
      src: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  const block2response = {
    id: '1',
    journeyId: '2',
    __typename: 'VideoBlock',
    parentBlockId: '3',
    parentOrder: 1,
    videoContent: {
      src: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId'
  }

  describe('VideoBlock Arclight', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoArclightResolvers,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      videoArclightResolvers = module.get<VideoArclightResolvers>(
        VideoArclightResolvers
      )
    })
    it('returns VideoBlock with Arclight', async () => {
      expect(await videoArclightResolvers.src(block1.videoContent)).toEqual(
        block1response.videoContent.src
      )
    })
  })

  describe('VideoBlock', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          get: jest.fn(() => block2)
        })
      }
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolvers,
          blockService,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      blockResolver = module.get<BlockResolvers>(BlockResolvers)
    })
    it('returns VideoBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(block2response)
    })
  })

  describe('Create Update', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          save: jest.fn((input) => input),
          update: jest.fn((input) => input)
        })
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolvers,
          blockService,
          VideoBlockResolvers,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      blockResolver = module.get<BlockResolvers>(BlockResolvers)
      videoBlockResolver = module.get<VideoBlockResolvers>(VideoBlockResolvers)
      service = await module.resolve(BlockService)
    })
    describe('videoBlockCreate', () => {
      it('creates a VideoBlock', async () => {
        videoBlockResolver
          .videoBlockCreate(blockUpdate)
          .catch((err) => console.log(err))
        expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
      })
    })

    describe('videoBlockUpdate', () => {
      it('updates a VideoBlock', async () => {
        videoBlockResolver
          .videoBlockUpdate('1', blockUpdate)
          .catch((err) => console.log(err))
        expect(service.update).toHaveBeenCalledWith('1', blockUpdate)
      })
    })
  })
})
