import { act, cleanup, render, waitFor } from '@testing-library/react'
import { ComponentProps } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

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
      setVideoEndTime: jest.fn()
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
    const props = {
      ...defaultProps,
      startTime: 5
    }
    render(<InitAndPlay {...props} />)

    act(() => {
      player?.trigger('seeked')
    })

    expect(player?.currentTime()).toBe(props.startAt)
    expect(props.setLoading).toHaveBeenCalledWith(false)
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

  // FIX (SWIPE): spyOn
  it.skip('should handle autoplay muted for first step', async () => {
    const stepBlock = {
      __typename: 'StepBlock',
      id: 'step1.id',
      parentOrder: 0
    } as unknown as TreeBlock<StepBlock>
    blockHistoryVar([stepBlock])

    render(<InitAndPlay {...defaultProps} />)

    act(() => {
      player.trigger('play')
    })

    expect(player.muted()).toBe(true)

    const playStub = jest.spyOn(player, 'play')
    await waitFor(() => expect(playStub).toHaveBeenCalled())
  })

  // FIX (SWIPE): spyOn
  it.skip('should handle autoplay muted on browser error', async () => {
    expect(true).toBe(true)

    render(<InitAndPlay {...defaultProps} />)

    jest.spyOn(player, 'play').mockImplementation(() => {
      throw new Error('Browser error')
    })
    expect(player.muted()).toBe(true)
  })

  it('should pause player when inactive', () => {
    expect(true).toBe(true)

    const props = {
      ...defaultProps,
      activeStep: false
    }

    render(<InitAndPlay {...props} />)
    expect(player.paused()).toBe(true)
  })

  it('should pause player when on admin', () => {
    expect(true).toBe(true)

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
