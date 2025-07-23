import { MockedProvider } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { v4 as uuidv4 } from 'uuid'
import videojs from 'video.js'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { VideoBlockSource } from '../../../__generated__/globalTypes'
import { TreeBlock, blockHistoryVar } from '../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../libs/plausibleHelpers'
import { VideoTriggerFields_triggerAction } from '../VideoTrigger/__generated__/VideoTriggerFields'

import {
  VIDEO_COLLAPSE_EVENT_CREATE,
  VIDEO_COMPLETE_EVENT_CREATE,
  VIDEO_EXPAND_EVENT_CREATE,
  VIDEO_PAUSE_EVENT_CREATE,
  VIDEO_PLAY_EVENT_CREATE,
  VIDEO_PROGRESS_EVENT_CREATE,
  VIDEO_START_EVENT_CREATE,
  VideoEventsProps
} from './VideoEvents'

import { VideoEvents } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))
const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>
mockUuidv4.mockReturnValue('uuid')

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

describe('VideoEvents', () => {
  let props: VideoEventsProps
  const mockOrigin = 'https://example.com'

  beforeAll(() => {
    delete (window as any).location
    window.location = { ...window.location,
      origin: mockOrigin
    } as any
  })

  beforeEach(() => {
    const video = document.createElement('video')
    document.body.appendChild(video)

    props = {
      player: videojs(video, {
        ...defaultVideoJsOptions,
        autoplay: false,
        muted: true,
        controls: true,
        controlBar: {
          playToggle: true,
          progressControl: {
            seekBar: true
          },
          fullscreenToggle: true
      } as any
      blockId: 'video0.id',
      startAt: 0,
      endAt: 100,
      videoTitle: 'video.title',
      source: VideoBlockSource.internal,
      videoId: 'video.id',
      action: null
    }
  })

  afterEach(() => {
    cleanup()
  })

  afterAll(() => {
    // Reset is handled by Jest automatically in v30
  })

  const activeBlock: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'step.id',
    parentBlockId: null,
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    slug: null,
    children: []
  }

  const input = {
    id: 'uuid',
    blockId: 'video0.id',
    stepId: 'step.id',
    label: 'video.title',
    value: VideoBlockSource.internal
  }

  const journey = {
    id: 'journey.id'
  } as unknown as Journey

  it('should create start event', async () => {
    blockHistoryVar([activeBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const result = jest.fn(() => ({
      data: {
        videoStartEventCreate: {
          id: 'uuid',
          __typename: 'VideoStartEvent'
      } as any
    } as any

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_START_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0
              } as any
            } as any
            },
            result
        } as any
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <VideoEvents {...props} />
        </JourneyProvider>
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0)
      props.player.trigger('timeupdate')

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoStart', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: props.player.currentTime(),
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoStart',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoStart',
          blockId: props.blockId
    } as any
  })

  it('should add start event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_START_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0
              } as any
            } as any
            },
            result: {
              data: {
                videoStartEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoStartEvent'
              } as any
            } as any
          } as any
        } as any
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0)
      props.player.trigger('timeupdate')

    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_start',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 0,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )
  })

  it('should create play event', async () => {
    blockHistoryVar([activeBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)
    const result = jest.fn(() => ({
      data: {
        videoPlayEventCreate: {
          id: 'uuid',
          __typename: 'VideoPlayEvent'
      } as any
    } as any

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_PLAY_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.12
              } as any
            } as any
            },
            result
        } as any
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <VideoEvents {...props} />
        </JourneyProvider>
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0.12)
      props.player.trigger('play')
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoPlay', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: props.player.currentTime(),
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoPlay',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoPlay',
          blockId: props.blockId
    } as any
  })

  it('should add play event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_PLAY_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.12
              } as any
            } as any
            },
            result: {
              data: {
                videoPlayEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoPlayEvent'
              } as any
            } as any
          } as any
        } as any
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0.12)
      props.player.trigger('play')
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_play',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 0.12,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )
  })

  it('should create pause event', async () => {
    blockHistoryVar([activeBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)
    const result = jest.fn(() => ({
      data: {
        videoPauseEventCreate: {
          id: 'uuid',
          __typename: 'VideoPauseEvent'
      } as any
    } as any

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_PAUSE_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.34
              } as any
            } as any
            },
            result
        } as any
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <VideoEvents {...props} />
        </JourneyProvider>
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0.34)
      props.player.trigger('pause')
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoPause', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: props.player.currentTime(),
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoPause',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoPause',
          blockId: props.blockId
    } as any
  })

  it('should add pause event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_PAUSE_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.34
              } as any
            } as any
            },
            result: {
              data: {
                videoPauseEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoPauseEvent'
              } as any
            } as any
          } as any
        } as any
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0.34)
      props.player.trigger('pause')
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_pause',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 0.34,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )
  })

  it('should create expand event', async () => {
    blockHistoryVar([activeBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)
    const result = jest.fn(() => ({
      data: {
        videoExpandEventCreate: {
          id: 'uuid',
          __typename: 'VideoExpandEvent'
      } as any
    } as any

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.56
              } as any
            } as any
            },
            result
        } as any
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <VideoEvents {...props} />
        </JourneyProvider>
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0.56)
      props.player.enterFullWindow()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoExpand', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: props.player.currentTime(),
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoExpand',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoExpand',
          blockId: props.blockId
    } as any
  })

  it('should add expand event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.56
              } as any
            } as any
            },
            result: {
              data: {
                videoExpandEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoExpandEvent'
              } as any
            } as any
          } as any
        } as any
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0.56)
      props.player.enterFullWindow()
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_expand',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 0.56,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )
  })

  it('should create collapse event', async () => {
    blockHistoryVar([activeBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)
    const result = jest.fn(() => ({
      data: {
        videoCollapseEventCreate: {
          id: 'uuid',
          __typename: 'VideoCollapseEvent'
      } as any
    } as any

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.78
              } as any
            } as any
            },
            result: {
              data: {
                videoExpandEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoExpandEvent'
              } as any
            } as any
          } as any
          },
          {
            request: {
              query: VIDEO_COLLAPSE_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.78
              } as any
            } as any
            },
            result
        } as any
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <VideoEvents {...props} />
        </JourneyProvider>
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0.78)
      props.player.enterFullWindow()
      void props.player.exitFullscreen()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoCollapse', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: props.player.currentTime(),
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoCollapse',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoCollapse',
          blockId: props.blockId
    } as any
  })

  it('should add collapse event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_EXPAND_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.78
              } as any
            } as any
            },
            result: {
              data: {
                videoExpandEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoExpandEvent'
              } as any
            } as any
          } as any
          },
          {
            request: {
              query: VIDEO_COLLAPSE_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0.78
              } as any
            } as any
            },
            result: {
              data: {
                videoCollapseEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoCollapseEvent'
              } as any
            } as any
          } as any
        } as any
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )
    act(() => {
      props.player.currentTime(0.78)
      props.player.enterFullWindow()
      void props.player.exitFullscreen()
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_collapse',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 0.78,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )
  })

  it('should create progress event and complete event', async () => {
    blockHistoryVar([activeBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)
    const resultStart = jest.fn(() => ({
      data: {
        videoStartEventCreate: {
          id: 'uuid',
          __typename: 'VideoStartEvent'
      } as any
    } as any

    const resultOne = jest.fn(() => ({
      data: {
        videoProgressEventCreate: {
          id: 'uuid',
          __typename: 'VideoProgressEvent'
      } as any
    } as any

    const resultTwo = jest.fn(() => ({
      data: {
        videoProgressEventCreate: {
          id: 'uuid',
          __typename: 'VideoProgressEvent'
      } as any
    } as any

    const resultThree = jest.fn(() => ({
      data: {
        videoProgressEventCreate: {
          id: 'uuid',
          __typename: 'VideoProgressEvent'
      } as any
    } as any

    const resultComplete = jest.fn(() => ({
      data: {
        videoCompleteEventCreate: {
          id: 'uuid',
          __typename: 'VideoCompleteEvent'
      } as any
    } as any

    const action = {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'step.id',
      gtmEventName: 'gtm.event',
      blockId: 'block2.id'
    } as unknown as VideoTriggerFields_triggerAction

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_START_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0
              } as any
            } as any
            },
            result: resultStart
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 25,
                  progress: 25
              } as any
            } as any
            },
            result: resultOne
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 50,
                  progress: 50
              } as any
            } as any
            },
            result: resultTwo
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 75,
                  progress: 75
              } as any
            } as any
            },
            result: resultThree
          },
          {
            request: {
              query: VIDEO_COMPLETE_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 102
              } as any
            } as any
            },
            result: resultComplete
        } as any
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <VideoEvents {...props} action={action} />
        </JourneyProvider>
      </MockedProvider>
    )

    act(() => {
      props.player.currentTime(0)
      props.player.trigger('timeupdate')
    await waitFor(() => expect(resultStart).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoStart', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: props.player.currentTime(),
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoStart',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoStart',
          blockId: props.blockId
    } as any

    act(() => {
      props.player.currentTime(25.1)
      props.player.trigger('timeupdate')
    await waitFor(() => expect(resultOne).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoProgress25', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: 25,
        progress: 25,
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoProgress25',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoProgress25',
          blockId: props.blockId
    } as any

    act(() => {
      props.player.currentTime(50.2)
      props.player.trigger('timeupdate')
    await waitFor(() => expect(resultTwo).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoProgress50', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: 50,
        progress: 50,
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoProgress50',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoProgress50',
          blockId: props.blockId
    } as any

    act(() => {
      props.player.currentTime(75.3)
      props.player.trigger('timeupdate')
    await waitFor(() => expect(resultThree).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('videoProgress75', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: props.blockId,
        position: 75,
        progress: 75,
        stepId: activeBlock.id,
        label: props.videoTitle,
        value: props.source,
        key: keyify({
          stepId: activeBlock.id,
          event: 'videoProgress75',
          blockId: props.blockId
        simpleKey: keyify({
          stepId: activeBlock.id,
          event: 'videoProgress75',
          blockId: props.blockId
    } as any

    act(() => {
      props.player.currentTime(100)
      props.player.trigger('timeupdate')
  })

  it('should add progress event and complete event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: VIDEO_START_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 0
              } as any
            } as any
            },
            result: {
              data: {
                videoStartEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoStartEvent'
              } as any
            } as any
          } as any
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 25,
                  progress: 25
              } as any
            } as any
            },
            result: {
              data: {
                videoProgressEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoProgressEvent'
              } as any
            } as any
          } as any
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 50,
                  progress: 50
              } as any
            } as any
            },
            result: {
              data: {
                videoProgressEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoProgressEvent'
              } as any
            } as any
          } as any
          },
          {
            request: {
              query: VIDEO_PROGRESS_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 75,
                  progress: 75
              } as any
            } as any
            },
            result: {
              data: {
                videoProgressEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoProgressEvent'
              } as any
            } as any
          } as any
          },
          {
            request: {
              query: VIDEO_COMPLETE_EVENT_CREATE,
              variables: {
                input: {
                  ...input,
                  position: 102
              } as any
            } as any
            },
            result: {
              data: {
                videoCompleteEventCreate: {
                  id: 'uuid',
                  __typename: 'VideoCompleteEvent'
              } as any
            } as any
          } as any
        } as any
        ]}
      >
        <VideoEvents {...props} />
      </MockedProvider>
    )

    act(() => {
      props.player.currentTime(0)
      props.player.trigger('timeupdate')
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_start',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 0,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )

    act(() => {
      props.player.currentTime(25.1)
      props.player.trigger('timeupdate')
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_progress',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 25.1,
        videoProgress: 25,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )

    act(() => {
      props.player.currentTime(50.2)
      props.player.trigger('timeupdate')
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_progress',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 50.2,
        videoProgress: 50,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )

    act(() => {
      props.player.currentTime(75.3)
      props.player.trigger('timeupdate')
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_progress',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 75.3,
        videoProgress: 75,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )

    act(() => {
      props.player.currentTime(100)
      props.player.trigger('timeupdate')
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'video_complete',
        eventId: 'uuid',
        blockId: 'video0.id',
        videoPosition: 102,
        videoTitle: 'video.title',
        videoId: 'video.id'
    )
  })
})
