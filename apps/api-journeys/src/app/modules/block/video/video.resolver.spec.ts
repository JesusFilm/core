import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import fetch, { Response } from 'node-fetch'

import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import {
  VideoBlockCreateInput,
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

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
    service: BlockService,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
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
      parentBlockId: 'parentBlockId',
      gtmEventName: 'gtmEventName',
      url: 'https://jesusfilm.org',
      target: 'target'
    },
    objectFit: 'fill'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: VideoBlockCreateInput = {
    id: 'blockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    posterBlockId: 'posterBlockId'
  }
  const blockUpdateInput: VideoBlockUpdateInput = {
    videoId: 'videoId',
    videoVariantLanguageId: 'videoVariantLanguageId',
    posterBlockId: 'posterBlockId'
  }
  const parentBlock = {
    id: 'parentBlockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    coverBlockId: 'coverBlockId',
    fullscreen: true
  } as unknown as Block
  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      getSiblings: jest.fn(() => [block, block]),
      removeBlockAndChildren: jest.fn((input) => input),
      update: jest.fn((input) => input)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        blockService,
        VideoBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<VideoBlockResolver>(VideoBlockResolver)
    service = await module.resolve(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('videoBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a VideoBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.videoBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          posterBlock: { connect: { id: 'posterBlockId' } },
          parentOrder: 2,
          coverBlockParent: undefined,
          typename: 'VideoBlock',
          videoId: 'videoId',
          videoVariantLanguageId: 'videoVariantLanguageId',
          action: {
            create: {
              gtmEventName: 'NavigateAction'
            }
          }
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockCreateInput.journeyId,
        blockCreateInput.parentBlockId
      )
    })

    it('creates a VideoBlock without poster block', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.videoBlockCreate(ability, {
          ...blockCreateInput,
          posterBlockId: null
        })
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          posterBlock: undefined,
          parentOrder: 2,
          typename: 'VideoBlock',
          videoId: 'videoId',
          videoVariantLanguageId: 'videoVariantLanguageId',
          action: {
            create: {
              gtmEventName: 'NavigateAction'
            }
          }
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })
    })

    it('creates a cover VideoBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      prismaService.block.findUnique.mockResolvedValueOnce(parentBlock)
      expect(
        await resolver.videoBlockCreate(ability, {
          ...blockCreateInput,
          isCover: true
        })
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          typename: 'VideoBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          posterBlock: { connect: { id: 'posterBlockId' } },
          coverBlockParent: { connect: { id: 'parentBlockId' } },
          parentOrder: null,
          videoId: 'videoId',
          videoVariantLanguageId: 'videoVariantLanguageId',
          action: {
            create: {
              gtmEventName: 'NavigateAction'
            }
          }
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })
      expect(service.removeBlockAndChildren).not.toHaveBeenCalled()
    })

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.videoBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })

    it('throws error if no parent block found for cover block', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.videoBlockCreate(ability, {
          ...blockCreateInput,
          isCover: true
        })
      ).rejects.toThrow('parent block not found')
    })

    it('removes old cover block', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce({
        ...parentBlock,
        coverBlock: block
      } as unknown as Block)
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.videoBlockCreate(ability, {
        ...blockCreateInput,
        isCover: true
      })
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(
        block,
        prismaService
      )
    })

    describe('Internal Source', () => {
      it('creates a VideoBlock', async () => {
        prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
        expect(
          await resolver.videoBlockCreate(ability, {
            id: 'blockId',
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            videoId: 'videoId',
            videoVariantLanguageId: 'videoVariantLanguageId',
            source: VideoBlockSource.internal
          })
        ).toEqual(blockWithUserTeam)
        expect(prismaService.block.create).toHaveBeenCalledWith({
          data: {
            action: {
              create: {
                gtmEventName: 'NavigateAction'
              }
            },
            id: 'blockId',
            videoId: 'videoId',
            videoVariantLanguageId: 'videoVariantLanguageId',
            source: VideoBlockSource.internal,
            journey: { connect: { id: 'journeyId' } },
            parentBlock: {
              connect: {
                id: 'parentBlockId'
              }
            },
            parentOrder: 2,
            typename: 'VideoBlock'
          },
          include: {
            action: true,
            journey: {
              include: {
                team: { include: { userTeams: true } },
                userJourneys: true
              }
            }
          }
        })
      })
    })

    describe('YouTube Source', () => {
      it('throws error when invalid videoId', async () => {
        await expect(
          async () =>
            await resolver.videoBlockCreate(ability, {
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
            await resolver.videoBlockCreate(ability, {
              journeyId: 'journeyId',
              parentBlockId: 'parentBlockId',
              videoId: 'ak06MSETeo4',
              source: VideoBlockSource.youTube
            })
        ).rejects.toThrow('videoId cannot be found on YouTube')
      })

      it('creates a VideoBlock', async () => {
        prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
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
          await resolver.videoBlockCreate(ability, {
            id: 'blockId',
            journeyId: 'journeyId',
            parentBlockId: 'parentBlockId',
            videoId: 'ak06MSETeo4',
            source: VideoBlockSource.youTube
          })
        ).toEqual(blockWithUserTeam)
        expect(prismaService.block.create).toHaveBeenCalledWith({
          data: {
            action: {
              create: {
                gtmEventName: 'NavigateAction'
              }
            },
            id: 'blockId',
            journey: { connect: { id: 'journeyId' } },
            videoId: 'ak06MSETeo4',
            source: VideoBlockSource.youTube,
            parentBlock: { connect: { id: 'parentBlockId' } },
            description:
              'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
            duration: 1167,
            image: 'https://i.ytimg.com/vi/7RoqnGcEjcs/hqdefault.jpg',
            title: 'What is the Bible?',
            parentOrder: 2,
            objectFit: null,
            typename: 'VideoBlock'
          },
          include: {
            action: true,
            journey: {
              include: {
                team: { include: { userTeams: true } },
                userJourneys: true
              }
            }
          }
        })
      })
    })
  })

  describe('videoBlockUpdate', () => {
    it('updates a VideoBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.videoBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.videoBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.videoBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })

    describe('Internal Source', () => {
      it('updates a VideoBlock', async () => {
        prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
        await resolver.videoBlockUpdate(ability, 'blockId', {
          videoId: 'videoId',
          videoVariantLanguageId: 'videoVariantLanguageId',
          source: VideoBlockSource.internal
        })
        expect(service.update).toHaveBeenCalledWith('blockId', {
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
        prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
        await expect(
          resolver.videoBlockUpdate(ability, 'blockId', {
            videoId: 'test',
            source: VideoBlockSource.youTube
          })
        ).rejects.toThrow('videoId must be a valid YouTube videoId')
      })

      it('throws error when videoId is not on YouTube', async () => {
        prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () =>
            await Promise.resolve({
              items: []
            })
        } as unknown as Response)
        await expect(
          resolver.videoBlockUpdate(ability, 'blockId', {
            videoId: 'ak06MSETeo4',
            source: VideoBlockSource.youTube
          })
        ).rejects.toThrow('videoId cannot be found on YouTube')
      })

      it('updates videoId', async () => {
        prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
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
        await resolver.videoBlockUpdate(ability, 'blockId', {
          videoId: 'ak06MSETeo4',
          source: VideoBlockSource.youTube
        })
        expect(service.update).toHaveBeenCalledWith('blockId', {
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

    describe('Cloudflare Source', () => {
      it('throws error when videoId is not on Cloudflare', async () => {
        prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
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
          resolver.videoBlockUpdate(ability, 'blockId', {
            videoId: 'ea95132c15732412d22c1476fa83f27a',
            source: VideoBlockSource.cloudflare
          })
        ).rejects.toThrow('videoId cannot be found on Cloudflare')
      })

      it('updates videoId', async () => {
        prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
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
        await resolver.videoBlockUpdate(ability, 'blockId', {
          videoId: 'ea95132c15732412d22c1476fa83f27a',
          source: VideoBlockSource.cloudflare
        })
        expect(service.update).toHaveBeenCalledWith('blockId', {
          videoId: 'ea95132c15732412d22c1476fa83f27a',
          source: VideoBlockSource.cloudflare,
          duration: 100,
          endAt: 100,
          image:
            'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/thumbnails/thumbnail.jpg?time=2s&height=768',
          title: 'video.mp4'
        })
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(
            /https:\/\/api\.cloudflare\.com\/client\/v4\/accounts\/.*\/stream\/ea95132c15732412d22c1476fa83f27a/
          ),
          { headers: { Authorization: expect.stringMatching(/Bearer .*/) } }
        )
      })

      it('updates videoId title when meta name not present', async () => {
        prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
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
        await resolver.videoBlockUpdate(ability, 'blockId', {
          videoId: 'ea95132c15732412d22c1476fa83f27a',
          source: VideoBlockSource.cloudflare
        })
        expect(service.update).toHaveBeenCalledWith('blockId', {
          videoId: 'ea95132c15732412d22c1476fa83f27a',
          source: VideoBlockSource.cloudflare,
          duration: 100,
          endAt: 100,
          image:
            'https://cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/thumbnails/thumbnail.jpg?time=2s&height=768',
          title: 'ea95132c15732412d22c1476fa83f27a'
        })
      })

      it('updates a VideoBlock', async () => {
        prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
        await resolver.videoBlockUpdate(ability, 'blockId', {
          autoplay: true,
          source: VideoBlockSource.cloudflare
        })
        expect(service.update).toHaveBeenCalledWith('blockId', {
          autoplay: true,
          source: VideoBlockSource.cloudflare
        })
      })
    })
  })

  describe('video', () => {
    it('returns video for external resolution', async () => {
      expect(
        await resolver.video({
          ...block,
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
          ...block,
          videoId: null,
          source: VideoBlockSource.internal
        })
      ).toBeNull()
    })

    it('returns null if videoVariantLanguageId is not set', async () => {
      expect(
        await resolver.video({
          ...block,
          videoVariantLanguageId: null,
          source: VideoBlockSource.internal
        })
      ).toBeNull()
    })

    it('returns null if source is not internal', async () => {
      expect(
        await resolver.video({
          ...block,
          source: VideoBlockSource.youTube
        })
      ).toBeNull()
    })
  })

  describe('source', () => {
    it('returns block source', () => {
      expect(
        resolver.source({ ...block, source: VideoBlockSource.youTube })
      ).toEqual(VideoBlockSource.youTube)
    })

    it('returns internal by default', () => {
      expect(resolver.source({ ...block, source: null })).toEqual(
        VideoBlockSource.internal
      )
    })
  })
})
