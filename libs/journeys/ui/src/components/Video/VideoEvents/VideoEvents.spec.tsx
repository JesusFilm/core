import { render, waitFor, act, cleanup } from '@testing-library/react'
import videojs from 'video.js'
import { MockedProvider } from '@apollo/client/testing'
import {
  VideoEventsProps,
  VIDEO_START_EVENT_CREATE,
  VIDEO_PLAY_EVENT_CREATE,
  VIDEO_PAUSE_EVENT_CREATE,
  VIDEO_COMPLETE_EVENT_CREATE,
  VIDEO_EXPAND_EVENT_CREATE,
  VIDEO_COLLAPSE_EVENT_CREATE,
  VIDEO_PROGRESS_EVENT_CREATE
} from './VideoEvents'
import { VideoEvents } from '.'

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
    act(() => {
      props.player.currentTime(0)
      props.player.trigger('timeupdate')
    })

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should create play event', async () => {
    const result = jest.fn(() => ({
      data: {
        videoPlayEventCreate: {
          id: 'uuid',
          __typename: 'VideoPlayEvent',
          position: 0.12
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_PLAY_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0.12 }
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
      props.player.currentTime(0.12)
      props.player.trigger('play')
    })
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should create pause event', async () => {
    const result = jest.fn(() => ({
      data: {
        videoPauseEventCreate: {
          id: 'uuid',
          __typename: 'VideoPauseEvent',
          position: 0.34
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_PAUSE_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0.34 }
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
      props.player.currentTime(0.34)
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
          position: 50
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
                input: { blockId: 'video0.id', position: 50 }
              }
            },
            result: {
              data: {
                videoStartEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoStartEvent',
                  position: 50
                }
              }
            }
          },
          {
            request: {
              query: VIDEO_COMPLETE_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 50 }
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
      props.player.currentTime(50)
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
          position: 0.56
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0.56 }
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
      props.player.currentTime(0.56)
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
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0.78 }
              }
            },
            result: {
              data: {
                videoExpandEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoExpandEvent',
                  position: 0.78
                }
              }
            }
          },
          {
            request: {
              query: VIDEO_COLLAPSE_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 0.78 }
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
      props.player.currentTime(0.78)
      props.player.enterFullWindow()
      props.player.exitFullscreen()
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
          position: 25,
          progress: 25
        }
      }
    }))

    const resultTwo = jest.fn(() => ({
      data: {
        videoProgressEventCreate: {
          id: 'uuid',
          __typename: 'VideoProgressEvent',
          position: 50,
          progress: 50
        }
      }
    }))

    const resultThree = jest.fn(() => ({
      data: {
        videoProgressEventCreate: {
          id: 'uuid',
          __typename: 'VideoProgressEvent',
          position: 75,
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
                input: { blockId: 'video0.id', position: 25, progress: 25 }
              }
            },
            result: resultOne
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 50, progress: 50 }
              }
            },
            result: resultTwo
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: { blockId: 'video0.id', position: 75, progress: 75 }
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
      props.player.trigger('timeupdate')
    })
    await waitFor(() => expect(resultStart).toHaveBeenCalled())

    act(() => {
      props.player.currentTime(25.1)
      props.player.trigger('timeupdate')
    })
    await waitFor(() => expect(resultOne).toHaveBeenCalled())

    act(() => {
      props.player.currentTime(50.2)
      props.player.trigger('timeupdate')
    })
    await waitFor(() => expect(resultTwo).toHaveBeenCalled())

    act(() => {
      props.player.currentTime(75.3)
      props.player.trigger('timeupdate')
    })
    await waitFor(() => expect(resultThree).toHaveBeenCalled())
  })
})
