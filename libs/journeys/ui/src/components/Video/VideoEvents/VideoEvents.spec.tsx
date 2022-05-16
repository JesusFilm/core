import { render, waitFor, act, cleanup } from '@testing-library/react'
import videojs from 'video.js'
import { MockedProvider } from '@apollo/client/testing'
import {
  VideoEvents,
  VideoEventsProps,
  VIDEO_START_EVENT_CREATE,
  VIDEO_PLAY_EVENT_CREATE,
  VIDEO_PAUSE_EVENT_CREATE,
  VIDEO_COMPLETE_EVENT_CREATE,
  VIDEO_EXPAND_EVENT_CREATE,
  VIDEO_COLLAPSE_EVENT_CREATE
} from './VideoEvents'

describe('VideoEvents', () => {
  let props: VideoEventsProps
  beforeEach(() => {
    const video = document.createElement('video')
    document.body.appendChild(video)

    props = {
      player: videojs(video, {
        autoplay: false,
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
      blockId: 'video0.id'
    }
  })
  afterEach(() => {
    cleanup()
  })

  const startMock = {
    request: {
      query: VIDEO_START_EVENT_CREATE,
      variables: {
        input: { blockId: 'video0.id', position: 0 }
      }
    },
    result: {
      data: {
        videoStartEventCreate: {
          id: 'uuid',
          __typename: 'VideoStartEvent',
          position: 0
        }
      }
    }
  }

  it('should create start event', async () => {
    const result = jest.fn(() => ({
      data: {
        videoStartEventCreate: {
          id: 'uuid',
          __typename: 'VideoStartEvent',
          position: 0
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_START_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0 }
              }
            },
            result
          }
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should create play event', async () => {
    const result = jest.fn(() => ({
      data: {
        videoPlayEventCreate: {
          id: 'uuid',
          __typename: 'VideoPlayEvent',
          position: 0
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          startMock,
          {
            request: {
              query: VIDEO_PLAY_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0 }
              }
            },
            result
          }
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.trigger('playing')
    })
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should create pause event', async () => {
    const result = jest.fn(() => ({
      data: {
        videoPauseEventCreate: {
          id: 'uuid',
          __typename: 'VideoPauseEvent',
          position: 0
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          startMock,
          {
            request: {
              query: VIDEO_PAUSE_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0 }
              }
            },
            result
          }
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.trigger('pause')
    })
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should create complete event', async () => {
    const result = jest.fn(() => ({
      data: {
        videoCompleteEventCreate: {
          id: 'uuid',
          __typename: 'VideoCompleteEvent',
          position: 0
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          startMock,
          {
            request: {
              query: VIDEO_COMPLETE_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0 }
              }
            },
            result
          }
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.trigger('ended')
    })
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should create expand event', async () => {
    const result = jest.fn(() => ({
      data: {
        videoExpandEventCreate: {
          id: 'uuid',
          __typename: 'VideoExpandEvent',
          position: 0
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          startMock,
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0 }
              }
            },
            result
          }
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.enterFullWindow()
    })
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should create collapse event', async () => {
    const result = jest.fn(() => ({
      data: {
        videoCollapseEventCreate: {
          id: 'uuid',
          __typename: 'VideoCollapseEvent',
          position: 0
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          startMock,
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0 }
              }
            },
            result: {
              data: {
                videoExpandEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoExpandEvent',
                  position: 0
                }
              }
            }
          },
          {
            request: {
              query: VIDEO_COLLAPSE_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0 }
              }
            },
            result
          }
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.enterFullWindow()
      props.player.exitFullscreen()
    })
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
