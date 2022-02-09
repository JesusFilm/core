import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { VideoBlockResolver, VideoArclightResolver } from './video.resolver'

describe('VideoBlockResolver', () => {
  let blockResolver: BlockResolver,
    resolver: VideoBlockResolver,
    videoArclightResolver: VideoArclightResolver,
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
    posterBlockId: 'posterBlockId',
    fullsize: null
  }

  const blockUpdate = {
    __typename: '',
    journeyId: '2',
    parentBlockId: '3',
    parentOrder: 0,
    videoContent: {
      mediaComponentId: '2_0-FallingPlates',
      languageId: '529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId',
    fullsize: null
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
    posterBlockId: 'posterBlockId',
    fullsize: null
  }

  const blockResponse1 = {
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
    posterBlockId: 'posterBlockId',
    fullsize: null
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
    posterBlockId: 'posterBlockId',
    fullsize: null
  }

  const blockResponse2 = {
    id: '1',
    journeyId: '2',
    __typename: 'VideoBlock',
    parentBlockId: '3',
    parentOrder: 1,
    videoContent: {
      src: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    title: 'title',
    posterBlockId: 'posterBlockId',
    fullsize: null
  }

  describe('VideoBlock Arclight', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoArclightResolver,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      videoArclightResolver = module.get<VideoArclightResolver>(
        VideoArclightResolver
      )
    })
    it('returns VideoBlock with Arclight', async () => {
      expect(await videoArclightResolver.src(block1.videoContent)).toEqual(
        blockResponse1.videoContent.src
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
          BlockResolver,
          blockService,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
    })
    it('returns VideoBlock', async () => {
      expect(await blockResolver.block('1')).toEqual(blockResponse2)
    })
  })

  describe('Create Update', () => {
    beforeEach(async () => {
      const blockService = {
        provide: BlockService,
        useFactory: () => ({
          save: jest.fn((input) => input),
          update: jest.fn((input) => input),
          getSiblings: jest.fn(() => [block1])
        })
      }

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BlockResolver,
          blockService,
          VideoBlockResolver,
          UserJourneyService,
          {
            provide: 'DATABASE',
            useFactory: () => mockDeep<Database>()
          }
        ]
      }).compile()
      blockResolver = module.get<BlockResolver>(BlockResolver)
      resolver = module.get<VideoBlockResolver>(VideoBlockResolver)
      service = await module.resolve(BlockService)
    })
    describe('videoBlockCreate', () => {
      it('creates a VideoBlock', async () => {
        await resolver
          .videoBlockCreate(blockUpdate)
          .catch((err) => console.log(err))
        expect(service.getSiblings).toHaveBeenCalledWith(
          blockUpdate.journeyId,
          blockUpdate.parentBlockId
        )
        expect(service.save).toHaveBeenCalledWith(blockCreateResponse)
      })
    })

    describe('videoBlockUpdate', () => {
      it('updates a VideoBlock', async () => {
        resolver
          .videoBlockUpdate('1', '2', blockUpdate)
          .catch((err) => console.log(err))
        expect(service.update).toHaveBeenCalledWith('1', blockUpdate)
      })
    })
  })
})
