import Player from 'video.js/dist/types/player'

import { PlayerAction } from '../../../../../../../libs/playerContext/PlayerContext'

interface HandleVideoTitleClickProps {
  player?: Player
  dispatch: (action: PlayerAction) => void
  mute: boolean
  volume: number
  play: boolean
}

export function handleVideoTitleClick({
  player,
  dispatch,
  mute,
  volume,
  play
}: HandleVideoTitleClickProps): void {
  if (player == null) return
  if (mute) {
    player.muted(false)
    dispatch({
      type: 'SetMute',
      mute: false
    })
  }
  if (volume === 0) {
    dispatch({
      type: 'SetVolume',
      volume: 100
    })
    player.volume(1)
  }
  if (!play) {
    void player.play()
  }
}
