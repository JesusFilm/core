import { render } from '@testing-library/react'
import videojs from 'video.js'
import { MockedProvider } from '@apollo/client/testing'
import { VideoEvents, VIDEO_START_EVENT_CREATE } from './VideoEvents'

describe('VideoEvents', () => {
  const video = document.createElement('video')
  document.body.appendChild(video)

  const props = {
    player: videojs(video, {
      autoplay: true,
      muted: true,
      controls: true,
      controlBar: {
        playToggle: true,
        progressControl: {
          seekBar: true
        },
        fullscreenToggle: true
      }
    }),
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
