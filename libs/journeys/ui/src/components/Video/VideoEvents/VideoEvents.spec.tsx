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
  VIDEO_PROGRESS_EVENT_CREATE
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
      blockId: 'video0.id',
      startAt: 0,
      endAt: 100
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

  it('should create progress event', async () => {
    const resultStart = jest.fn(() => ({
      data: {
        videoStartEventCreate: {
          id: 'uuid',
          __typename: 'VideoStartEvent',
          position: 0
        }
      }
    }))

    const resultOne = jest.fn(() => ({
      data: {
        videoProgressEventCreate: {
          id: 'uuid',
          __typename: 'VideoProgressEvent',
          position: 26,
          progress: 25
        }
      }
    }))

    const resultTwo = jest.fn(() => ({
      data: {
        videoProgressEventCreate: {
          id: 'uuid',
          __typename: 'VideoProgressEvent',
          position: 51,
          progress: 50
        }
      }
    }))

    const resultThree = jest.fn(() => ({
      data: {
        videoProgressEventCreate: {
          id: 'uuid',
          __typename: 'VideoProgressEvent',
          position: 76,
          progress: 75
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
            result: resultStart
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 26, progress: 25 }
              }
            },
            result: resultOne
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 51, progress: 50 }
              }
            },
            result: resultTwo
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 76, progress: 75 }
              }
            },
            result: resultThree
          }
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )

    act(() => {
      props.player.currentTime(0)
    })
    await waitFor(() => expect(resultStart).toHaveBeenCalled())

    act(() => {
      props.player.currentTime(26)
      props.player.trigger('timeupdate')
    })
    await waitFor(() => expect(resultOne).toHaveBeenCalled())

    act(() => {
      props.player.currentTime(51)
      props.player.trigger('timeupdate')
    })
    await waitFor(() => expect(resultTwo).toHaveBeenCalled())

    act(() => {
      props.player.currentTime(76)
      props.player.trigger('timeupdate')
    })
    await waitFor(() => expect(resultThree).toHaveBeenCalled())
  })
})
