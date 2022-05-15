import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { VideoEvents, VIDEO_START_EVENT_CREATE } from './VideoEvents'

describe('VideoEvents', () => {
  const props = {
    player: {
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
    blockId: 'video0.id',
    videoPosition: 0
  }

  it('should create start event', () => {
    const result = jest.fn(() => ({
      data: {
        id: 'uuid',
        position: 30
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_START_EVENT_CREATE,
              variables: {
                id: 'uuid',
                blockId: 'video0.id',
                position: 30
              }
            },
            result
          }
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
  })
})
