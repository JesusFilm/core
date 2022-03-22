import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import {
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { VideoBlockResolver } from './video.resolver'

describe('VideoBlockResolver', () => {
  let resolver: VideoBlockResolver, service: BlockService

  const blockCreate: VideoBlockCreateInput = {
    id: 'abc',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId'
  }

  const createdBlock: VideoBlock & {
    videoId: string
    videoVariantLanguageId: string
  } = {
    id: 'abc',
    __typename: 'VideoBlock',
    parentOrder: 0,
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId'
  }

  const blockUpdate: VideoBlockUpdateInput = {
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    startAt: 5,
    endAt: 10,
    muted: true,
    autoplay: true,
    posterBlockId: 'posterBlockId',
    fullsize: true
  }

  const updatedBlock: VideoBlock & {
    videoId: string
    videoVariantLanguageId: string
  } = {
    id: 'abc',
    __typename: 'VideoBlock',
    parentOrder: 0,
    journeyId: 'journeyId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    startAt: 5,
    endAt: 10,
    muted: true,
    autoplay: true,
    posterBlockId: 'posterBlockId',
    fullsize: true
  }

  beforeEach(async () => {
    const blockService = {
      provide: BlockService,
      useFactory: () => ({
        save: jest.fn((input) => createdBlock),
        update: jest.fn((id, input) => updatedBlock),
        getSiblings: jest.fn(() => [])
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
    resolver = module.get<VideoBlockResolver>(VideoBlockResolver)
    service = await module.resolve(BlockService)
  })

  describe('videoBlockCreate', () => {
    it('creates a VideoBlock', async () => {
      await resolver.videoBlockCreate(blockCreate)
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockCreate.journeyId,
        blockCreate.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith(createdBlock)
    })
  })

  describe('videoBlockUpdate', () => {
    it('updates a VideoBlock', async () => {
      expect(
        await resolver.videoBlockUpdate('blockId', 'journeyId', blockUpdate)
      ).toEqual(updatedBlock)
    })
  })

  describe('video', () => {
    it('returns video for external resolution', async () => {
      expect(await resolver.video(createdBlock)).toEqual({
        __typename: 'Video',
        id: 'videoId',
        variant: {
          __typename: 'VideoVariant',
          language: {
            __typename: 'Language',
            id: 'videoVariantLanguageId'
          }
        }
      })
    })

    it('returns null if videoId is not set', async () => {
      expect(
        await resolver.video({ ...createdBlock, videoId: undefined })
      ).toEqual(null)
    })

    it('returns null if videoVariantLanguageId is not set', async () => {
      expect(
        await resolver.video({
          ...createdBlock,
          videoVariantLanguageId: undefined
        })
      ).toEqual(null)
    })
  })
})
