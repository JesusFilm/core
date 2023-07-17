import { Test, TestingModule } from '@nestjs/testing'
import fetch, { Response } from 'node-fetch'
import omit from 'lodash/omit'

import {
  CardBlock,
  VideoBlock,
  VideoBlockObjectFit as ObjectFit,
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { UserJourneyService } from '../../userJourney/userJourney.service'
import { UserRoleService } from '../../userRole/userRole.service'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockResolver } from '../block.resolver'
import { BlockService, OMITTED_BLOCK_FIELDS } from '../block.service'
import {
  CloudflareRetrieveVideoDetailsResponse,
  VideoBlockResolver
} from './video.resolver'

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
  let resolver: VideoBlockResolver,
    service: jest.Mocked<BlockService>,
    prismaService: PrismaService

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
      parentBlockId: 'abc',
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    },
    objectFit: 'fill'
  }

  const actionResponse = block.action

  const blockCreate = {
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
    typename: 'VideoBlock' as const,
    parentOrder: 0,
    journey: { connect: { id: 'journeyId' } },
    journeyId: 'journeyId',
    parentBlock: {
      connect: { id: 'parentBlockId' }
    },
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    posterBlockId: 'posterBlockId',
    source: 'youTube',
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
    journeyId: 'journeyId',
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
        PrismaService
      ]
    }).compile()
    resolver = module.get<VideoBlockResolver>(VideoBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = await module.resolve(PrismaService)
    prismaService.block.findUnique = jest
      .fn()
      .mockImplementationOnce((id) =>
        id === createdBlock.id ? createdBlock : parentBlock
      )
    prismaService.action.create = jest.fn().mockResolvedValue(actionResponse)
  })

  describe('videoBlockCreate', () => {
    it('creates a VideoBlock', async () => {
      expect(await resolver.videoBlockCreate(blockCreate)).toEqual(createdBlock)
      expect(service.getSiblings).toHaveBeenCalledWith(
        'journeyId',
        blockCreate.parentBlockId
      )
      expect(service.save).toHaveBeenCalledWith({
        ...omit(blockCreate, 'parentBlockId'),
        id: 'abc',
        typename: 'VideoBlock',
        journey: { connect: { id: 'journeyId' } },
        journeyId: 'journeyId',
        parentBlock: { connect: { id: 'parentBlockId' } },
        parentOrder: 0
      })
    })

    it('creates a cover VideoBlock', async () => {
      await resolver.videoBlockCreate({ ...blockCreate, isCover: true })

      expect(service.save).toHaveBeenCalledWith({
        ...omit(blockCreate, [...OMITTED_BLOCK_FIELDS, 'parentBlockId']),
        id: 'abc',
        typename: 'VideoBlock',
        isCover: true,
        journey: { connect: { id: 'journeyId' } },
        journeyId: 'journeyId',
        parentBlock: { connect: { id: 'parentBlockId' } },
        coverBlockParent: { connect: { id: 'parentBlockId' } },
        parentOrder: null
      })
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(
        parentBlock.coverBlockId,
        parentBlock.journeyId
      )
    })

    describe('Internal Source', () => {
      it('creates a VideoBlock', async () => {
        expect(
          await resolver.videoBlockCreate({
            id: 'abc',
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            videoId: 'videoId',
            videoVariantLanguageId: 'videoVariantLanguageId',
            source: VideoBlockSource.internal
          })
        ).toEqual({
          ...createdBlock,
          journeyId: 'journeyId',
          videoId: 'videoId',
          videoVariantLanguageId: 'videoVariantLanguageId',
          parentBlock: { connect: { id: 'parentBlockId' } },
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
            id: 'abc',
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            videoId: 'ak06MSETeo4',
            source: VideoBlockSource.youTube
          })
        ).toEqual({
          ...createdBlock,
          journeyId: 'journeyId',
          videoId: 'ak06MSETeo4',
          source: VideoBlockSource.youTube,
          parentBlock: { connect: { id: 'parentBlockId' } },
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
          objectFit: 'fill'
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

    describe('Cloudflare Source', () => {
      it('throws error when videoId is not on Cloudflare', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve<CloudflareRetrieveVideoDetailsResponse>({
              errors: [],
              messages: [],
              result: null,
              success: false
            })
        } as unknown as Response)
        await expect(
          async () =>
            await resolver.videoBlockUpdate('blockId', 'journeyId', {
              videoId: 'ea95132c15732412d22c1476fa83f27a',
              source: VideoBlockSource.cloudflare
            })
        ).rejects.toThrow('videoId cannot be found on Cloudflare')
      })

      it('updates videoId', async () => {
        prismaService.block.findUnique = jest.fn().mockResolvedValueOnce({
          ...updatedBlock,
          videoId: undefined
        })
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve<CloudflareRetrieveVideoDetailsResponse>({
              errors: [],
              messages: [],
              result: {
                duration: 100,
                input: {
                  height: 0,
                  width: 0
                },
                playback: {
                  hls: 'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/manifest/video.m3u8'
                },
                preview:
                  'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/watch',
                readyToStream: true,
                size: 4190963,
                thumbnail:
                  'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/thumbnails/thumbnail.jpg',
                uid: 'ea95132c15732412d22c1476fa83f27a',
                meta: {
                  name: 'video.mp4'
                }
              },
              success: true
            })
        } as unknown as Response)
        expect(
          await resolver.videoBlockUpdate('blockId', 'journeyId', {
            videoId: 'ea95132c15732412d22c1476fa83f27a',
            source: VideoBlockSource.cloudflare
          })
        ).toEqual({
          ...updatedBlock,
          videoId: 'ea95132c15732412d22c1476fa83f27a',
          source: VideoBlockSource.cloudflare,
          duration: 100,
          endAt: 100,
          image:
            'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/thumbnails/thumbnail.jpg?time=2s',
          title: 'video.mp4',
          objectFit: 'fill'
        })
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.cloudflare.com/client/v4/accounts//stream/ea95132c15732412d22c1476fa83f27a',
          { headers: { Authorization: 'Bearer ' } }
        )
      })

      it('updates videoId title when meta name not present', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve<CloudflareRetrieveVideoDetailsResponse>({
              errors: [],
              messages: [],
              result: {
                duration: 100,
                input: {
                  height: 0,
                  width: 0
                },
                playback: {
                  hls: 'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/manifest/video.m3u8'
                },
                preview:
                  'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/watch',
                readyToStream: true,
                size: 4190963,
                thumbnail:
                  'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/thumbnails/thumbnail.jpg',
                uid: 'ea95132c15732412d22c1476fa83f27a',
                meta: {}
              },
              success: true
            })
        } as unknown as Response)
        expect(
          await resolver.videoBlockUpdate('blockId', 'journeyId', {
            videoId: 'ea95132c15732412d22c1476fa83f27a',
            source: VideoBlockSource.cloudflare
          })
        ).toEqual({
          ...updatedBlock,
          videoId: 'ea95132c15732412d22c1476fa83f27a',
          source: VideoBlockSource.cloudflare,
          duration: 100,
          endAt: 100,
          image:
            'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/thumbnails/thumbnail.jpg?time=2s',
          title: 'ea95132c15732412d22c1476fa83f27a',
          objectFit: 'fill'
        })
      })

      it('updates a VideoBlock', async () => {
        expect(
          await resolver.videoBlockUpdate('blockId', 'journeyId', {
            autoplay: true,
            source: VideoBlockSource.cloudflare
          })
        ).toEqual({
          ...updatedBlock,
          autoplay: true,
          source: VideoBlockSource.cloudflare
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
          ...blockCreate,
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
          ...blockCreate,
          videoId: undefined,
          source: VideoBlockSource.internal
        })
      ).toEqual(null)
    })

    it('returns null if videoVariantLanguageId is not set', async () => {
      expect(
        await resolver.video({
          ...blockCreate,
          videoVariantLanguageId: undefined,
          source: VideoBlockSource.internal
        })
      ).toEqual(null)
    })

    it('returns null if source is not internal', async () => {
      expect(
        await resolver.video({
          ...blockCreate,
          source: VideoBlockSource.youTube
        })
      ).toEqual(null)
    })
  })
})
