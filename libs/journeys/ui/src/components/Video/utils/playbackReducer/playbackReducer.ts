export enum PlaybackEvent {
  PLAY,
  PAUSE,
  MUTE,
  UNMUTE
}

type MobileAction = 'play' | 'pause' | 'unmute'

export interface PlaybackState {
  playing: boolean
  muted: boolean
  action: MobileAction
}

export function playbackReducer(
  state: PlaybackState,
  event: { type: PlaybackEvent }
): PlaybackState {
  switch (event.type) {
    case PlaybackEvent.PLAY:
      return {
        ...state,
        playing: true,
        action: state.muted ? 'unmute' : 'pause'
      }
    case PlaybackEvent.PAUSE:
      return {
        ...state,
        playing: false,
        action: 'play'
      }
    case PlaybackEvent.MUTE:
      return {
        ...state,
        muted: true,
        action: state.playing ? 'unmute' : 'play'
      }
    case PlaybackEvent.UNMUTE:
      return {
        ...state,
        muted: false,
        action: state.playing ? 'pause' : 'play'
      }
  }
}
