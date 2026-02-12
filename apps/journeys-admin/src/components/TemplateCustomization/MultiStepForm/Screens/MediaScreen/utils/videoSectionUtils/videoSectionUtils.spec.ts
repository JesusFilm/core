import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'

import {
  getCustomizableCardVideoBlock,
  getVideoBlockDisplayTitle,
  getVideoPoster,
  showVideosSection
} from './videoSectionUtils'

function createBaseVideoBlock(
  overrides: Partial<VideoBlock> = {}
): VideoBlock {
  return {
    __typename: 'VideoBlock',
    id: 'video-block-1',
    parentBlockId: null,
    parentOrder: 0,
    muted: null,
    autoplay: null,
    startAt: null,
    endAt: null,
    posterBlockId: null,
    fullsize: null,
    videoId: null,
    videoVariantLanguageId: null,
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    showGeneratedSubtitles: null,
    subtitleLanguage: null,
    mediaVideo: null,
    action: null,
    eventLabel: null,
    endEventLabel: null,
    customizable: null,
    ...overrides
  } as VideoBlock
}

describe('videoSectionUtils', () => {
  describe('getCustomizableCardVideoBlock', () => {
    it('returns null when journey is null', () => {
      expect(getCustomizableCardVideoBlock(undefined, 'card-1')).toBeNull()
    })

    it('returns null when cardBlockId is null', () => {
      const journey = { __typename: 'Journey' } as unknown as Journey
      expect(getCustomizableCardVideoBlock(journey, null)).toBeNull()
    })

    it('returns the first matching video block', () => {
      const videoBlock = {
        __typename: 'VideoBlock',
        id: 'video-1',
        customizable: true,
        parentBlockId: 'card-1'
      } as unknown as VideoBlock

      const journey = {
        blocks: [videoBlock]
      } as unknown as Journey

      expect(getCustomizableCardVideoBlock(journey, 'card-1')).toEqual(
        videoBlock
      )
    })
  })

  describe('showVideosSection', () => {
    it('returns false when no card is selected', () => {
      const journey = {
        __typename: 'Journey'
      } as unknown as Journey
      const cardBlockId = null

      expect(showVideosSection(journey, cardBlockId)).toBe(false)
    })

    it('returns false when journey is undefined', () => {
      const journey = undefined
      const cardBlockId = 'card-1'

      expect(showVideosSection(journey, cardBlockId)).toBe(false)
    })

    it('returns false when selected card has no customizable video blocks', () => {
      const journey = {
        blocks: [
          {
            __typename: 'VideoBlock',
            id: 'video-1',
            customizable: true,
            parentBlockId: 'other-card-id'
          }
        ]
      } as unknown as Journey

      expect(showVideosSection(journey, 'card-1')).toBe(false)
    })

    it('returns true when selected card has a customizable video block', () => {
      const videoBlock = {
        __typename: 'VideoBlock',
        id: 'video-1',
        customizable: true,
        parentBlockId: 'card-1'
      } as unknown as VideoBlock

      const journey = {
        blocks: [videoBlock]
      } as unknown as Journey

      expect(showVideosSection(journey, 'card-1')).toBe(true)
    })
  })

  describe('getVideoBlockDisplayTitle', () => {
    it('returns block.title when it is non-empty', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: 'My Video Title',
        source: VideoBlockSource.internal
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('My Video Title')
    })

    it('returns empty string when block.title is null', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: null,
        source: VideoBlockSource.internal
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('')
    })

    it('returns empty string when block.title is whitespace only', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: '   ',
        source: VideoBlockSource.internal
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('')
    })

    it('returns first mediaVideo.title value for internal source when block.title is empty', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: '',
        source: VideoBlockSource.internal,
        mediaVideo: {
          __typename: 'Video' as const,
          title: [{ value: 'Internal Video Title' }]
        }
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('Internal Video Title')
    })

    it('returns first mediaVideo.title value for cloudflare source when block.title is empty', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: '',
        source: VideoBlockSource.cloudflare,
        mediaVideo: {
          __typename: 'Video' as const,
          title: [{ value: 'Cloudflare Video Title' }]
        }
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('Cloudflare Video Title')
    })

    it('returns empty string when mediaVideo is missing', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: '',
        source: VideoBlockSource.internal,
        mediaVideo: null
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('')
    })

    it('returns empty string when mediaVideo is not Video typename', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: '',
        source: VideoBlockSource.internal,
        mediaVideo: { __typename: 'OtherType' }
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('')
    })

    it('returns empty string when mediaVideo.title is empty array', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: '',
        source: VideoBlockSource.internal,
        mediaVideo: {
          __typename: 'Video' as const,
          title: []
        }
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('')
    })

    it('returns empty string when mediaVideo.title[0].value is null', () => {
      const block = {
        __typename: 'VideoBlock' as const,
        title: '',
        source: VideoBlockSource.internal,
        mediaVideo: {
          __typename: 'Video' as const,
          title: [{ value: null }]
        }
      } as unknown as VideoBlock

      expect(getVideoBlockDisplayTitle(block)).toBe('')
    })
  })

  describe('getVideoPoster', () => {
    it('returns Mux thumbnail URL when source is mux and playbackId is present', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.mux,
        mediaVideo: {
          __typename: 'MuxVideo',
          id: 'mux-id',
          assetId: 'asset-id',
          playbackId: 'playback-123'
        }
      })

      expect(getVideoPoster(videoBlock)).toBe(
        'https://image.mux.com/playback-123/thumbnail.png?time=1'
      )
    })

    it('returns undefined when source is mux but playbackId is null', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.mux,
        mediaVideo: {
          __typename: 'MuxVideo',
          id: 'mux-id',
          assetId: 'asset-id',
          playbackId: null
        }
      })

      expect(getVideoPoster(videoBlock)).toBeUndefined()
    })

    it('returns undefined when source is mux but mediaVideo is null', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.mux,
        mediaVideo: null
      })

      expect(getVideoPoster(videoBlock)).toBeUndefined()
    })

    it('returns undefined when source is mux but mediaVideo is not MuxVideo', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.mux,
        mediaVideo: {
          __typename: 'YouTube',
          id: 'yt-id'
        }
      })

      expect(getVideoPoster(videoBlock)).toBeUndefined()
    })

    it('returns image when source is YouTube and image is present', () => {
      const imageUrl = 'https://i.ytimg.com/vi/abc123/mqdefault.jpg'
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.youTube,
        videoId: 'abc123',
        image: imageUrl
      })

      expect(getVideoPoster(videoBlock)).toBe(imageUrl)
    })

    it('returns undefined when source is YouTube but image is null', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.youTube,
        videoId: 'abc123',
        image: null
      })

      expect(getVideoPoster(videoBlock)).toBeUndefined()
    })

    it('returns mobileCinematicHigh when source is internal and Video has images', () => {
      const posterUrl =
        'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.internal,
        mediaVideo: {
          __typename: 'Video',
          id: 'video-id',
          title: [],
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh: posterUrl
            }
          ],
          variant: null,
          variantLanguages: []
        }
      })

      expect(getVideoPoster(videoBlock)).toBe(posterUrl)
    })

    it('returns mobileCinematicHigh when source is cloudflare and Video has images', () => {
      const posterUrl =
        'https://imagedelivery.net/cf/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg'
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.cloudflare,
        mediaVideo: {
          __typename: 'Video',
          id: 'video-id',
          title: [],
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh: posterUrl
            }
          ],
          variant: null,
          variantLanguages: []
        }
      })

      expect(getVideoPoster(videoBlock)).toBe(posterUrl)
    })

    it('returns undefined when source is internal but images array is empty', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.internal,
        mediaVideo: {
          __typename: 'Video',
          id: 'video-id',
          title: [],
          images: [],
          variant: null,
          variantLanguages: []
        }
      })

      expect(getVideoPoster(videoBlock)).toBeUndefined()
    })

    it('returns undefined when source is internal but images[0].mobileCinematicHigh is null', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.internal,
        mediaVideo: {
          __typename: 'Video',
          id: 'video-id',
          title: [],
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh: null
            }
          ],
          variant: null,
          variantLanguages: []
        }
      })

      expect(getVideoPoster(videoBlock)).toBeUndefined()
    })

    it('returns undefined when source is internal but mediaVideo is not Video typename', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.internal,
        mediaVideo: {
          __typename: 'MuxVideo',
          id: 'mux-id',
          assetId: null,
          playbackId: null
        }
      })

      expect(getVideoPoster(videoBlock)).toBeUndefined()
    })

    it('returns undefined when source is internal but mediaVideo is null', () => {
      const videoBlock = createBaseVideoBlock({
        source: VideoBlockSource.internal,
        mediaVideo: null
      })

      expect(getVideoPoster(videoBlock)).toBeUndefined()
    })
  })
})
