import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import {
  CardBlock,
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { VideoBlockResolver } from './video.resolver'

describe('VideoBlockResolver', () => {
  let resolver: VideoBlockResolver, service: BlockService

  const block = {
    id: 'abc',
    journeyId: 'journeyId',
    parentOrder: 0,
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    startAt: 5,
    endAt: 10,
    muted: true,
    autoplay: true,
    posterBlockId: 'posterBlockId',
    fullsize: true,
    action: {
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    }
  }

  const actionResponse = {
    ...block.action,
    parentBlockId: block.id
  }

  const blockCreate: VideoBlockCreateInput = {
    id: 'abc',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId'
  }

  const navigateAction = {
    parentBlockId: 'abc',
    gtmEventName: 'NavigateAction',
    blockId: null,
    journeyId: null,
    url: null,
    target: null
  }

  const createdBlock: VideoBlock = {
    id: 'abc',
    __typename: 'VideoBlock',
    parentOrder: 0,
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    posterBlockId: 'posterBlockId',
    startAt: 5,
    endAt: 10,
    muted: true,
    autoplay: true,
    fullsize: true,
    action: navigateAction
  }

  const parentBlock: CardBlock = {
    id: 'parentBlockId',
    journeyId: createdBlock.journeyId,
    __typename: 'CardBlock',
    parentBlockId: '0',
    parentOrder: 0,
    coverBlockId: createdBlock.id,
    fullscreen: true
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

  const updatedBlock: VideoBlock = {
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
        get: jest.fn((id) =>
          id === createdBlock.id ? createdBlock : parentBlock
        ),
        removeBlockAndChildren: jest.fn((input) => input),
        save: jest.fn((input) => ({ ...createdBlock, ...input })),
        update: jest.fn((id, input) => ({ ...updatedBlock, ...input })),
        getSiblings: jest.fn(() => [])
      })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockResolver,
        blockService,
        VideoBlockResolver,
        UserJourneyService,
        UserRoleService,
        JourneyService,
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
      expect(await resolver.videoBlockCreate(blockCreate)).toEqual(createdBlock)
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockCreate.journeyId,
        blockCreate.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith({
        ...blockCreate,
        __typename: 'VideoBlock',
        parentOrder: 0
      })
      expect(service.update).toHaveBeenCalledWith(createdBlock.id, createdBlock)
    })

    it('creates a cover VideoBlock', async () => {
      await resolver.videoBlockCreate({ ...blockCreate, isCover: true })

      expect(service.save).toHaveBeenCalledWith({
        ...blockCreate,
        __typename: 'VideoBlock',
        isCover: true,
        parentOrder: null
      })
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(
        parentBlock.coverBlockId,
        parentBlock.journeyId
      )
      expect(service.update).toHaveBeenCalledWith(parentBlock.id, {
        coverBlockId: createdBlock.id
      })
    })

    it('throws validation when invalid URL', async () => {
      await expect(
        async () =>
          await resolver.videoBlockCreate({
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            videoUrl: 'test'
          })
      ).rejects.toThrow('videoUrl must be a valid YouTube URL')
    })

    it('throws validation when URL not from YouTube', async () => {
      await expect(
        async () =>
          await resolver.videoBlockCreate({
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            videoUrl: 'https://google.com'
          })
      ).rejects.toThrow('videoUrl must be a valid YouTube URL')
    })

    it('creates a VideoBlock when URL from YouTube', async () => {
      expect(
        await resolver.videoBlockCreate({
          journeyId: 'journeyId',
          parentBlockId: 'parentBlockId',
          videoUrl: 'https://www.youtube.com/watch?v=ak06MSETeo4'
        })
      ).toEqual({
        ...createdBlock,
        videoUrl: 'https://www.youtube.com/watch?v=ak06MSETeo4'
      })
    })
  })

  describe('videoBlockUpdate', () => {
    it('updates a VideoBlock', async () => {
      expect(
        await resolver.videoBlockUpdate('blockId', 'journeyId', blockUpdate)
      ).toEqual(updatedBlock)
    })

    it('throws validation when invalid URL', async () => {
      await expect(
        async () =>
          await resolver.videoBlockUpdate('blockId', 'journeyId', {
            videoUrl: 'test'
          })
      ).rejects.toThrow('videoUrl must be a valid YouTube URL')
    })

    it('throws validation when URL not from YouTube', async () => {
      await expect(
        async () =>
          await resolver.videoBlockUpdate('blockId', 'journeyId', {
            videoUrl: 'https://google.com'
          })
      ).rejects.toThrow('videoUrl must be a valid YouTube URL')
    })

    it('updates a VideoBlock when URL from YouTube', async () => {
      expect(
        await resolver.videoBlockUpdate('blockId', 'journeyId', {
          videoUrl: 'https://www.youtube.com/watch?v=ak06MSETeo4'
        })
      ).toEqual({
        ...updatedBlock,
        videoUrl: 'https://www.youtube.com/watch?v=ak06MSETeo4'
      })
    })
  })

  describe('action', () => {
    it('returns the action', async () => {
      expect(await resolver.action(block as unknown as VideoBlock)).toEqual(
        actionResponse
      )
    })
  })

  describe('video', () => {
    it('returns video for external resolution', async () => {
      expect(await resolver.video(createdBlock)).toEqual({
        __typename: 'Video',
        id: 'videoId',
        primaryLanguageId: 'videoVariantLanguageId'
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
