import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'

import { getVideoBlockDisplayTitle } from './getVideoBlockDisplayTitle'

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
