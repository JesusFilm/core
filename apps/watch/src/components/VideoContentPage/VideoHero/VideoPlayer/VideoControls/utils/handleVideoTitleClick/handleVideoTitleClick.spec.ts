import { jest } from '@jest/globals'
import Player from 'video.js/dist/types/player'

import { handleVideoTitleClick } from '.'

describe('handleVideoTitleClick', () => {
  const dispatch = jest.fn()

  const player = {
    muted: jest.fn(),
    volume: jest.fn(),
    play: jest.fn()
  } as unknown as Player
  const onMuteToggle = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should do nothing if player is not provided', () => {
    handleVideoTitleClick({
      player: undefined,
      dispatch,
      mute: true,
      volume: 0,
      play: false
    })
    expect(player.muted).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    expect(player.volume).not.toHaveBeenCalled()
    expect(player.play).not.toHaveBeenCalled()
  })

  it('should unmute and play video if muted, volume is 0 and not playing', () => {
    handleVideoTitleClick({
      player,
      dispatch,
      mute: true,
      volume: 0,
      play: false,
      onMuteToggle
    })
    expect(player.muted).toHaveBeenCalledWith(false)
    expect(dispatch).toHaveBeenCalledWith({ type: 'SetMute', mute: false })
    expect(dispatch).toHaveBeenCalledWith({ type: 'SetVolume', volume: 100 })
    expect(player.volume).toHaveBeenCalledWith(1)
    expect(player.play).toHaveBeenCalled()
    expect(onMuteToggle).toHaveBeenCalledWith(false)
  })

  it('should increase volume and play if volume is 0 and not playing', () => {
    handleVideoTitleClick({
      player,
      dispatch,
      mute: false,
      volume: 0,
      play: false
    })
    expect(player.muted).not.toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({ type: 'SetVolume', volume: 100 })
    expect(player.volume).toHaveBeenCalledWith(1)
    expect(player.play).toHaveBeenCalled()
  })

  it('should just play if not muted, volume is not 0 and not playing', () => {
    handleVideoTitleClick({
      player,
      dispatch,
      mute: false,
      volume: 50,
      play: false
    })
    expect(player.muted).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    expect(player.volume).not.toHaveBeenCalled()
    expect(player.play).toHaveBeenCalled()
  })

  it('should not do anything if playing, not muted and volume is not 0', () => {
    handleVideoTitleClick({
      player,
      dispatch,
      mute: false,
      volume: 50,
      play: true
    })
    expect(player.muted).not.toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
    expect(player.volume).not.toHaveBeenCalled()
    expect(player.play).not.toHaveBeenCalled()
  })

  it('should only unmute if muted but playing with good volume', () => {
    handleVideoTitleClick({
      player,
      dispatch,
      mute: true,
      volume: 50,
      play: true
    })
    expect(player.muted).toHaveBeenCalledWith(false)
    expect(dispatch).toHaveBeenCalledWith({ type: 'SetMute', mute: false })
    expect(dispatch).not.toHaveBeenCalledWith({
      type: 'SetVolume',
      volume: 100
    })
    expect(player.volume).not.toHaveBeenCalled()
    expect(player.play).not.toHaveBeenCalled()
  })
})
