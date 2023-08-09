import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'

import { videoBlockSourceToLabel } from './videoBlockSourceToLabel'

describe('videoBlockSourceToLabel', () => {
  function t(string: string): string {
    return string
  }

  it('returns Jesus Film Library', () => {
    expect(videoBlockSourceToLabel(VideoBlockSource.internal, t)).toBe(
      'Jesus Film Library'
    )
  })

  it('returns YouTube', () => {
    expect(videoBlockSourceToLabel(VideoBlockSource.youTube, t)).toBe('YouTube')
  })

  it('returns Custom', () => {
    expect(videoBlockSourceToLabel(VideoBlockSource.cloudflare, t)).toBe(
      'Custom'
    )
  })
})
