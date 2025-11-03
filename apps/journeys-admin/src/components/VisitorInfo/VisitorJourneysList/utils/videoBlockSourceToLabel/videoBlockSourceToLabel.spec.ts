import { TFunction } from 'i18next'

import { VideoBlockSource } from '../../../../../../__generated__/globalTypes'

import { videoBlockSourceToLabel } from './videoBlockSourceToLabel'

describe('videoBlockSourceToLabel', () => {
  const t = ((string): string => string) as unknown as TFunction<
    'apps-journeys-admin',
    undefined
  >

  it('returns Jesus Film Library', () => {
    expect(videoBlockSourceToLabel(VideoBlockSource.internal, t)).toBe(
      'Jesus Film Library'
    )
  })

  it('returns YouTube', () => {
    expect(videoBlockSourceToLabel(VideoBlockSource.youTube, t)).toBe('YouTube')
  })

  it('returns Custom', () => {
    expect(videoBlockSourceToLabel(VideoBlockSource.mux, t)).toBe('Custom')
  })
})
