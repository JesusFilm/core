import { Dispatch, createContext, useContext, useReducer } from 'react'

/**
 * State interface for the video player
 */
export interface PlayerState {
  play: boolean
  active: boolean
  currentTime: string
  progress: number
  progressPercentNotYetEmitted: number[]
  volume: number
  mute: boolean
  fullscreen: boolean
  openSubtitleDialog: boolean
  loadSubtitleDialog: boolean
  loading: boolean
  durationSeconds: number
  duration: string
}

/**
 * Initial state for the video player
 */
export const playerInitialState: PlayerState = {
  play: false,
  active: true,
  currentTime: '0:00',
  progress: 0,
  progressPercentNotYetEmitted: [10, 25, 50, 75, 90],
  volume: 0,
  mute: true,
  fullscreen: false,
  openSubtitleDialog: false,
  loadSubtitleDialog: false,
  loading: false,
  durationSeconds: 0,
  duration: '0:00'
}

/**
 * Actions for controlling the video player state
 */

/**
 * Action to set the player's playing state.
 */
interface SetPlayAction {
  type: 'SetPlay'
  /** Whether the video should be playing. */
  play: boolean
}

/**
 * Action to set the player's active state.
 */
interface SetActiveAction {
  type: 'SetActive'
  /** Whether the player controls are active/visible. */
  active: boolean
}

/**
 * Action to set the current playback time.
 */
interface SetCurrentTimeAction {
  type: 'SetCurrentTime'
  /** The current time as a formatted string (e.g., '1:23'). */
  currentTime: string
}

/**
 * Action to set the playback progress.
 */
interface SetProgressAction {
  type: 'SetProgress'
  /** The playback progress as a percentage (0-100). */
  progress: number
}

/**
 * Action to set the player's volume.
 */
interface SetVolumeAction {
  type: 'SetVolume'
  /** The volume level (0-1). */
  volume: number
}

/**
 * Action to set the player's mute state.
 */
interface SetMuteAction {
  type: 'SetMute'
  /** Whether the player is muted. */
  mute: boolean
}

/**
 * Action to set the player's fullscreen state.
 */
interface SetFullscreenAction {
  type: 'SetFullscreen'
  /** Whether the player is in fullscreen mode. */
  fullscreen: boolean
}

/**
 * Action to open or close the subtitle selection dialog.
 */
interface SetOpenSubtitleDialogAction {
  type: 'SetOpenSubtitleDialog'
  /** Whether the subtitle dialog should be open. */
  openSubtitleDialog: boolean
}

/**
 * Action to set the loading state for the subtitle dialog.
 */
interface SetLoadSubtitleDialogAction {
  type: 'SetLoadSubtitleDialog'
  /** Whether the subtitle dialog is loading content. */
  loadSubtitleDialog: boolean
}

/**
 * Action to set the player's loading state.
 */
interface SetLoadingAction {
  type: 'SetLoading'
  /** Whether the player is in a loading state. */
  loading: boolean
}

/**
 * Action to set the total duration of the video in seconds.
 */
interface SetDurationSecondsAction {
  type: 'SetDurationSeconds'
  /** The total duration in seconds. */
  durationSeconds: number
}

/**
 * Action to set the total duration of the video as a formatted string.
 */
interface SetDurationAction {
  type: 'SetDuration'
  /** The total duration as a formatted string (e.g., '10:00'). */
  duration: string
}

/**
 * Action to update the list of progress percentages that have not yet been emitted.
 */
interface SetProgressPercentNotYetEmittedAction {
  type: 'SetProgressPercentNotYetEmitted'
  /** An array of progress percentages (e.g., [10, 25, 50, 75, 90]). */
  progressPercentNotYetEmitted: number[]
}

/**
 * Union type of all possible actions for the player context
 */
export type PlayerAction =
  | SetPlayAction
  | SetActiveAction
  | SetCurrentTimeAction
  | SetProgressAction
  | SetVolumeAction
  | SetMuteAction
  | SetFullscreenAction
  | SetOpenSubtitleDialogAction
  | SetLoadSubtitleDialogAction
  | SetLoadingAction
  | SetDurationSecondsAction
  | SetDurationAction
  | SetProgressPercentNotYetEmittedAction

export type PlayerInitialState = Partial<PlayerState>

const PlayerContext = createContext<{
  state: PlayerState
  dispatch: Dispatch<PlayerAction>
}>({
  state: playerInitialState,
  dispatch: () => null
})

export const reducer = (
  state: PlayerState,
  action: PlayerAction
): PlayerState => {
  switch (action.type) {
    case 'SetPlay':
      return { ...state, play: action.play }
    case 'SetActive':
      return { ...state, active: action.active }
    case 'SetCurrentTime':
      return { ...state, currentTime: action.currentTime }
    case 'SetProgress':
      return { ...state, progress: action.progress }
    case 'SetVolume':
      return { ...state, volume: action.volume }
    case 'SetMute':
      return { ...state, mute: action.mute }
    case 'SetFullscreen':
      return { ...state, fullscreen: action.fullscreen }
    case 'SetOpenSubtitleDialog':
      return { ...state, openSubtitleDialog: action.openSubtitleDialog }
    case 'SetLoadSubtitleDialog':
      return { ...state, loadSubtitleDialog: action.loadSubtitleDialog }
    case 'SetLoading':
      return { ...state, loading: action.loading }
    case 'SetDurationSeconds':
      return { ...state, durationSeconds: action.durationSeconds }
    case 'SetDuration':
      return { ...state, duration: action.duration }
    case 'SetProgressPercentNotYetEmitted':
      return {
        ...state,
        progressPercentNotYetEmitted: action.progressPercentNotYetEmitted
      }
  }
}

interface PlayerProviderProps {
  children: React.ReactNode
  initialState?: PlayerInitialState
}

export function PlayerProvider({
  children,
  initialState
}: PlayerProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...playerInitialState,
    ...initialState
  })
  return (
    <PlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer(): {
  state: PlayerState
  dispatch: Dispatch<PlayerAction>
} {
  const context = useContext(PlayerContext)

  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }

  return context
}
