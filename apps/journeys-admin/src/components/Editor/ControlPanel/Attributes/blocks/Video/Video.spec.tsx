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
      title: 'watch',
      startAt: 0,
      endAt: null,
      muted: true,
      autoplay: true,
      fullsize: true,
      videoContent: {
        __typename: 'VideoGeneric',
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      posterBlockId: null,
      children: []
    }

    const { getByText } = render(<Video {...video} />)

    expect(getByText('Video Source')).toBeInTheDocument()
    expect(getByText(video.title)).toBeInTheDocument()
  })
})
