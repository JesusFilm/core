import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import fetch, { Response } from 'node-fetch'
import {
  CardBlock,
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockObjectFit as ObjectFit,
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockResolver } from '../block.resolver'
import { BlockService } from '../block.service'
import { VideoBlockResolver } from './video.resolver'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

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
    },
    objectFit: 'fill'
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

  const createdBlock = {
    id: 'abc',
    __typename: 'VideoBlock' as const,
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
    action: navigateAction,
    objectFit: null
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

  const updatedBlock = {
    id: 'abc',
    __typename: 'VideoBlock' as const,
    parentOrder: 0,
    journeyId: 'journeyId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    startAt: 5,
    endAt: 10,
    muted: true,
    autoplay: true,
    posterBlockId: 'posterBlockId',
    fullsize: true,
    objectFit: ObjectFit.fill
  }

  beforeEach(async () => {
    mockFetch.mockClear()
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
        PrismaService,
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

    describe('Internal Source', () => {
      it('creates a VideoBlock', async () => {
        expect(
          await resolver.videoBlockCreate({
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            videoId: 'videoId',
            videoVariantLanguageId: 'videoVariantLanguageId',
            source: VideoBlockSource.internal
          })
        ).toEqual({
          ...createdBlock,
          videoId: 'videoId',
          videoVariantLanguageId: 'videoVariantLanguageId',
          source: VideoBlockSource.internal
        })
      })
    })

    describe('YouTube Source', () => {
      it('throws error when invalid videoId', async () => {
        await expect(
          async () =>
            await resolver.videoBlockCreate({
              journeyId: 'journeyId',
              parentBlockId: 'parentBlockId',
              videoId: 'test',
              source: VideoBlockSource.youTube
            })
        ).rejects.toThrow('videoId must be a valid YouTube videoId')
      })

      it('throws error when videoId is not on YouTube', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              items: []
            })
        } as unknown as Response)
        await expect(
          async () =>
            await resolver.videoBlockCreate({
              journeyId: 'journeyId',
              parentBlockId: 'parentBlockId',
              videoId: 'ak06MSETeo4',
              source: VideoBlockSource.youTube
            })
        ).rejects.toThrow('videoId cannot be found on YouTube')
      })

      it('creates a VideoBlock', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              items: [
                {
                  id: 'ak06MSETeo4',
                  snippet: {
                    title: 'What is the Bible?',
                    description:
                      'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
                    thumbnails: {
                      high: {
                        url: 'https://i.ytimg.com/vi/7RoqnGcEjcs/hqdefault.jpg'
                      }
                    }
                  },
                  contentDetails: {
                    duration: 'PT19M27S'
                  }
                }
              ]
            })
        } as unknown as Response)
        expect(
          await resolver.videoBlockCreate({
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            videoId: 'ak06MSETeo4',
            source: VideoBlockSource.youTube
          })
        ).toEqual({
          ...createdBlock,
          videoId: 'ak06MSETeo4',
          source: VideoBlockSource.youTube,
          description:
            'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
          duration: 1167,
          image: 'https://i.ytimg.com/vi/7RoqnGcEjcs/hqdefault.jpg',
          title: 'What is the Bible?'
        })
      })
    })
  })

  describe('videoBlockUpdate', () => {
    it('updates a VideoBlock with no source', async () => {
      expect(
        await resolver.videoBlockUpdate('blockId', 'journeyId', blockUpdate)
      ).toEqual({ ...updatedBlock, source: undefined })
    })

    describe('Internal Source', () => {
      it('updates a VideoBlock', async () => {
        expect(
          await resolver.videoBlockUpdate('blockId', 'journeyId', {
            videoId: 'videoId',
            videoVariantLanguageId: 'videoVariantLanguageId',
            source: VideoBlockSource.internal
          })
        ).toEqual({
          ...updatedBlock,
          videoId: 'videoId',
          videoVariantLanguageId: 'videoVariantLanguageId',
          source: VideoBlockSource.internal,
          title: null,
          description: null,
          image: null,
          duration: null
        })
      })
    })

    describe('YouTube Source', () => {
      it('throws error when invalid videoId', async () => {
        await expect(
          async () =>
            await resolver.videoBlockUpdate('blockId', 'journeyId', {
              videoId: 'test',
              source: VideoBlockSource.youTube
            })
        ).rejects.toThrow('videoId must be a valid YouTube videoId')
      })

      it('throws error when videoId is not on YouTube', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              items: []
            })
        } as unknown as Response)
        await expect(
          async () =>
            await resolver.videoBlockUpdate('blockId', 'journeyId', {
              videoId: 'ak06MSETeo4',
              source: VideoBlockSource.youTube
            })
        ).rejects.toThrow('videoId cannot be found on YouTube')
      })

      it('updates videoId', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              items: [
                {
                  id: 'ak06MSETeo4',
                  snippet: {
                    title: 'What is the Bible?',
                    description:
                      'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
                    thumbnails: {
                      high: {
                        url: 'https://i.ytimg.com/vi/7RoqnGcEjcs/hqdefault.jpg'
                      }
                    }
                  },
                  contentDetails: {
                    duration: 'PT19M27S'
                  }
                }
              ]
            })
        } as unknown as Response)
        expect(
          await resolver.videoBlockUpdate('blockId', 'journeyId', {
            videoId: 'ak06MSETeo4',
            source: VideoBlockSource.youTube
          })
        ).toEqual({
          ...updatedBlock,
          videoId: 'ak06MSETeo4',
          source: VideoBlockSource.youTube,
          description:
            'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
          duration: 1167,
          image: 'https://i.ytimg.com/vi/7RoqnGcEjcs/hqdefault.jpg',
          title: 'What is the Bible?',
          objectFit: null
        })
      })

      it('updates a VideoBlock', async () => {
        expect(
          await resolver.videoBlockUpdate('blockId', 'journeyId', {
            autoplay: true,
            source: VideoBlockSource.youTube
          })
        ).toEqual({
          ...updatedBlock,
          autoplay: true,
          source: VideoBlockSource.youTube
        })
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
      expect(
        await resolver.video({
          ...createdBlock,
          source: VideoBlockSource.internal
        })
      ).toEqual({
        __typename: 'Video',
        id: 'videoId',
        primaryLanguageId: 'videoVariantLanguageId'
      })
    })

    it('returns null if videoId is not set', async () => {
      expect(
        await resolver.video({
          ...createdBlock,
          videoId: undefined,
          source: VideoBlockSource.internal
        })
      ).toEqual(null)
    })

    it('returns null if videoVariantLanguageId is not set', async () => {
      expect(
        await resolver.video({
          ...createdBlock,
          videoVariantLanguageId: undefined,
          source: VideoBlockSource.internal
        })
      ).toEqual(null)
    })

    it('returns null if source is not internal', async () => {
      expect(
        await resolver.video({
          ...createdBlock,
          source: VideoBlockSource.youTube
        })
      ).toEqual(null)
    })
  })
})
