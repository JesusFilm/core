import { Test, TestingModule } from '@nestjs/testing'

import { Block } from '@core/prisma/journeys/client'

import { VideoBlockSource } from '../../../__generated__/graphql'

import { VideoBlockResolver } from './video.resolver'

describe('VideoBlockResolver', () => {
  let resolver: VideoBlockResolver

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
    objectFit: 'fill',
    updatedAt: '2024-10-21T04:32:25.858Z'
  } as unknown as Block

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [VideoBlockResolver]
    }).compile()
    resolver = module.get<VideoBlockResolver>(VideoBlockResolver)
  })

  afterEach(() => {
    jest.clearAllMocks()
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
