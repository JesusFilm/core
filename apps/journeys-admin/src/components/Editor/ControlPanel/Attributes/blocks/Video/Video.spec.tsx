import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { Video } from './Video'

describe('Video', () => {
  it('should display Video Options', () => {
    const video: TreeBlock<VideoBlock> = {
      id: 'video1.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: true,
      autoplay: true,
      fullsize: true,
      videoId: '2_0-FallingPlates',
      videoVariantLanguageId: '529',
      video: {
        __typename: 'Video',
        id: '2_0-FallingPlates',
        title: [
          {
            __typename: 'Translation',
            value: 'FallingPlates'
          }
        ],
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
        variant: {
          __typename: 'VideoVariant',
          id: '2_0-FallingPlates-529',
          hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
        }
      },
      posterBlockId: null,
      children: []
    }

    const { getByText } = render(<Video {...video} />)

    expect(getByText('Video Source')).toBeInTheDocument()
    expect(
      getByText('https://arc.gt/hls/2_0-FallingPlates/529')
    ).toBeInTheDocument()
  })
})
