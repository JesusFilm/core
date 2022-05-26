import { render, waitFor, act, cleanup } from '@testing-library/react'
import videojs from 'video.js'
import { MockedProvider } from '@apollo/client/testing'
import { v4 as uuidv4 } from 'uuid'
import TagManager from 'react-gtm-module'
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

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))
const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>
mockUuidv4.mockReturnValue('uuid')

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

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
                input: { id: 'uuid', blockId: 'video0.id', position: 0 }
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

  it('should add start event to dataLayer', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_START_EVENT_CREATE,
              variables: {
                input: { id: 'uuid', blockId: 'video0.id', position: 0 }
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
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0)
      props.player.trigger('timeupdate')
    })

    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_start',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 0
        }
      })
    )
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
                input: { id: 'uuid', blockId: 'video0.id', position: 0.12 }
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

  it('should add play event to dataLayer', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_PLAY_EVENT_CREATE,
              variables: {
                input: { id: 'uuid', blockId: 'video0.id', position: 0.12 }
              }
            },
            result: {
              data: {
                videoPlayEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoPlayEvent',
                  position: 0.12
                }
              }
            }
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
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_play',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 0.12
        }
      })
    )
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
                input: { id: 'uuid', blockId: 'video0.id', position: 0.34 }
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

  it('should add pause event to dataLayer', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_PAUSE_EVENT_CREATE,
              variables: {
                input: { id: 'uuid', blockId: 'video0.id', position: 0.34 }
              }
            },
            result: {
              data: {
                videoPauseEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoPauseEvent',
                  position: 0.34
                }
              }
            }
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
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_pause',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 0.34
        }
      })
    )
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
                input: { id: 'uuid', blockId: 'video0.id', position: 0.56 }
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

  it('should add expand event to dataLayer', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: { id: 'uuid', blockId: 'video0.id', position: 0.56 }
              }
            },
            result: {
              data: {
                videoExpandEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoExpandEvent',
                  position: 0.56
                }
              }
            }
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
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_expand',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 0.56
        }
      })
    )
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
                input: { id: 'uuid', blockId: 'video0.id', position: 0.78 }
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
                input: { id: 'uuid', blockId: 'video0.id', position: 0.78 }
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

  it('should add collapse event to dataLayer', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: { id: 'uuid', blockId: 'video0.id', position: 0.78 }
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
                input: { id: 'uuid', blockId: 'video0.id', position: 0.78 }
              }
            },
            result: {
              data: {
                videoCollapseEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoCollapseEvent',
                  position: 0
                }
              }
            }
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
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_collapse',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 0.78
        }
      })
    )
  })

  it('should create progress event and complete event', async () => {
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

    const resultComplete = jest.fn(() => ({
      data: {
        videoCompleteEventCreate: {
          id: 'uuid',
          __typename: 'VideoCompleteEvent',
          position: 100
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
                input: { id: 'uuid', blockId: 'video0.id', position: 0 }
              }
            },
            result: resultStart
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'video0.id',
                  position: 25,
                  progress: 25
                }
              }
            },
            result: resultOne
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'video0.id',
                  position: 50,
                  progress: 50
                }
              }
            },
            result: resultTwo
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'video0.id',
                  position: 75,
                  progress: 75
                }
              }
            },
            result: resultThree
          },
          {
            request: {
              query: VIDEO_COMPLETE_EVENT_CREATE,
              variables: {
                input: { id: 'uuid', blockId: 'video0.id', position: 100 }
              }
            },
            result: resultComplete
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

    act(() => {
      props.player.currentTime(100)
      props.player.trigger('timeupdate')
    })
    await waitFor(() => expect(resultComplete).toHaveBeenCalled())
  })

  it('should add progress event and complete event to dataLayer', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_START_EVENT_CREATE,
              variables: {
                input: { id: 'uuid', blockId: 'video0.id', position: 0 }
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
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'video0.id',
                  position: 25,
                  progress: 25
                }
              }
            },
            result: {
              data: {
                videoProgressEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoProgressEvent',
                  position: 25,
                  progress: 25
                }
              }
            }
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'video0.id',
                  position: 50,
                  progress: 50
                }
              }
            },
            result: {
              data: {
                videoProgressEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoProgressEvent',
                  position: 50,
                  progress: 50
                }
              }
            }
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'video0.id',
                  position: 75,
                  progress: 75
                }
              }
            },
            result: {
              data: {
                videoProgressEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoProgressEvent',
                  position: 75,
                  progress: 75
                }
              }
            }
          },
          {
            request: {
              query: VIDEO_COMPLETE_EVENT_CREATE,
              variables: {
                input: { id: 'uuid', blockId: 'video0.id', position: 100 }
              }
            },
            result: {
              data: {
                videoCompleteEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoCompleteEvent',
                  position: 100
                }
              }
            }
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
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_start',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 0
        }
      })
    )

    act(() => {
      props.player.currentTime(25.1)
      props.player.trigger('timeupdate')
    })
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_progress',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 25.1,
          videoProgress: 25
        }
      })
    )

    act(() => {
      props.player.currentTime(50.2)
      props.player.trigger('timeupdate')
    })
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_progress',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 50.2,
          videoProgress: 50
        }
      })
    )

    act(() => {
      props.player.currentTime(75.3)
      props.player.trigger('timeupdate')
    })
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_progress',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 75.3,
          videoProgress: 75
        }
      })
    )

    act(() => {
      props.player.currentTime(100)
      props.player.trigger('timeupdate')
    })
    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'video_complete',
          eventId: 'uuid',
          blockId: 'video0.id',
          videoPosition: 100
        }
      })
    )
  })
})
