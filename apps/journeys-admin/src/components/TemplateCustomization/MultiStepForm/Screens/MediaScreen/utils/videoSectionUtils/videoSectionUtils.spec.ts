import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'

import {
  getCustomizableCardVideoBlock,
  getVideoBlockDisplayTitle,
  showVideosSection
} from './videoSectionUtils'

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
})
