import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'
import { videoBlockSourceToLabel } from './videoBlockSourceToLabel'

describe('videoBlockSourceToLabel', () => {
  function t(string: string): string {
    return string
  }

  it('returns Jesus Film Library', () => {
    expect(videoBlockSourceToLabel(VideoBlockSource.internal, t)).toEqual(
      'Jesus Film Library'
    )
  })

  it('returns Instagram', () => {
    expect(videoBlockSourceToLabel(VideoBlockSource.youTube, t)).toEqual(
      'YouTube'
    )
  })
})
