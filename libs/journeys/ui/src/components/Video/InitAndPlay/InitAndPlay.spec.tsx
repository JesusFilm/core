import { act, cleanup, render } from '@testing-library/react'
import { ComponentProps } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock, blockHistoryVar } from '../../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../../libs/block/__generated__/BlockFields'

import { InitAndPlay } from '.'

describe('InitAndPlay', () => {
  let defaultProps: ComponentProps<typeof InitAndPlay>
  let player: Player

  beforeEach(() => {
    const video = document.createElement('video')
    document.body.appendChild(video)
    player = videojs(video, {
      ...defaultVideoJsOptions,
      autoplay: true,
      muted: false,
      controls: true,
      controlBar: {
        playToggle: true,
        progressControl: {
          seekBar: true
        },
        fullscreenToggle: true
      }
    })

    defaultProps = {
      videoRef: { current: video },
      player,
      setPlayer: jest.fn(),
      activeStep: true,
      triggerTimes: [0],
      videoEndTime: 100,
      selectedBlock: undefined,
      blockId: 'blockId',
      muted: false,
      startAt: 10,
      endAt: 100,
      autoplay: true,
      posterBlock: undefined,
      setLoading: jest.fn(),
      setShowPoster: jest.fn(),
      setVideoEndTime: jest.fn(),
      source: VideoBlockSource.internal
    }
  })

  afterEach(() => {
    cleanup()
  })

  it('should set player', () => {
    render(<InitAndPlay {...defaultProps} />)
    expect(defaultProps.setPlayer).toHaveBeenCalled()
  })

  it('should listen for player ready', () => {
    render(<InitAndPlay {...defaultProps} />)

    act(() => {
      player.trigger('ready')
    })

    expect(player?.currentTime()).toBe(defaultProps.startAt)
    expect(defaultProps.setLoading).toHaveBeenCalledWith(false)
  })

  it('should listen for player seeked', () => {
    render(<InitAndPlay {...defaultProps} />)

    act(() => {
      player?.trigger('seeked')
    })

    expect(player?.currentTime()).toBe(defaultProps.startAt)
    expect(defaultProps.setLoading).toHaveBeenCalledWith(false)
  })

  it('should listen for player canplay', () => {
    render(<InitAndPlay {...defaultProps} />)

    act(() => {
      player?.trigger('canplay')
    })

    expect(defaultProps.setLoading).toHaveBeenCalledWith(false)
  })

  it('should listen for player playing', () => {
    render(<InitAndPlay {...defaultProps} />)

    act(() => {
      player?.trigger('playing')
    })

    expect(defaultProps.setLoading).toHaveBeenCalledWith(false)
    expect(defaultProps.setShowPoster).toHaveBeenCalledWith(false)
  })

  it('should listen for player ended', () => {
    render(<InitAndPlay {...defaultProps} />)

    act(() => {
      player?.enterFullWindow()
      player?.trigger('ended')
    })

    expect(defaultProps.setLoading).toHaveBeenCalledWith(false)
    expect(player?.isFullscreen()).toBe(false)
  })

  it('should handle player duration change', () => {
    render(<InitAndPlay {...defaultProps} />)

    act(() => {
      player?.duration(20)
      player?.trigger('durationchange')
    })

    expect(defaultProps.setVideoEndTime).toHaveBeenCalledWith(20)
  })

  it('should handle autoplay', () => {
    const playStub = jest.spyOn(player, 'play')

    render(<InitAndPlay {...defaultProps} />)

    expect(playStub).toHaveBeenCalled()
  })

  it('should handle autoplay muted for first step', () => {
    const stepBlock = {
      __typename: 'StepBlock',
      id: 'step1.id',
      parentOrder: 0
    } as unknown as TreeBlock<StepBlock>
    blockHistoryVar([stepBlock])

    const playStub = jest.spyOn(player, 'play')

    render(<InitAndPlay {...defaultProps} />)

    expect(player.muted()).toBe(true)
    expect(playStub).toHaveBeenCalled()
  })

  it('should pause player when inactive', () => {
    const props = {
      ...defaultProps
    }

    render(<InitAndPlay {...props} />)
    expect(player.paused()).toBe(true)
  })

  it('should pause player when on admin', () => {
    const stepBlock = {
      __typename: 'StepBlock',
      id: 'step1.id',
      parentOrder: 0
    } as unknown as TreeBlock<StepBlock>

    const props = {
      ...defaultProps,
      selectedBlock: stepBlock
    }

    render(<InitAndPlay {...props} />)
    expect(player.paused()).toBe(true)
  })
})
