import { gql } from '@apollo/client'
import { NextRouter } from 'next/router'
import { Dispatch, createContext, useContext, useReducer } from 'react'

import { GetAllLanguages_languages as Language } from '../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug_video_variantLanguagesWithSlug as AudioLanguage } from '../../../__generated__/GetLanguagesSlug'
import { GetSubtitles_video_variant_subtitle as SubtitleLanguage } from '../../../__generated__/GetSubtitles'
import { LANGUAGE_MAPPINGS } from '../localeMapping'

// TODO: move this into language switcher dialog component
export const GET_ALL_LANGUAGES = gql`
  query GetAllLanguages {
    languages {
      id
      bcp47
      slug
      name {
        primary
        value
      }
    }
  }
`

/**
 * State interface for watch context containing language preferences and video-specific data
 */
export interface WatchState {
  /** Current site/UI language (e.g., 'en', 'es') */
  siteLanguage: string
  /** User's preferred audio language ID (e.g., '529')*/
  audioLanguage: string
  /** User's preferred subtitle language ID (e.g., '529')*/
  subtitleLanguage: string
  /** Whether subtitles are enabled by user preference */
  subtitleOn: boolean
  /** Loading state for operations that require page reload */
  loading?: boolean
  /** Next.js router instance for triggering page reloads */
  router?: NextRouter
  /** Current video ID being watched */
  videoId?: string
  /** Current video variant slug being watched */
  videoVariantSlug?: string
  /** All available languages from the system */
  allLanguages?: Language[]
  /** Available audio languages for the current video */
  videoAudioLanguages?: AudioLanguage[]
  /** Available subtitle languages for the current video */
  videoSubtitleLanguages?: SubtitleLanguage[]
  /** Currently selected audio language object (based on availability and preferences) */
  currentAudioLanguage?: AudioLanguage
  /** Whether subtitles should be enabled (based on availability) */
  currentSubtitleOn?: boolean
  /** Video player state */
  player: VideoPlayerState
}

/**
 * State interface for the video player
 */
export interface VideoPlayerState {
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
export const videoPlayerInitialState: VideoPlayerState = {
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
 * Action to update user language preferences
 * Can update multiple preferences at once - only provided fields will be updated
 */
interface SetLanguagePreferencesAction {
  type: 'SetLanguagePreferences'
  /** Site/UI language to set */
  siteLanguage?: string
  /** Audio language preference to set */
  audioLanguage?: string
  /** Subtitle language preference to set */
  subtitleLanguage?: string
  /** Subtitle enabled preference to set */
  subtitleOn?: boolean
}

/**
 * Action to set all available languages from the system
 */
interface SetAllLanguagesAction {
  type: 'SetAllLanguages'
  /** Complete list of all available languages */
  allLanguages: Language[]
}

/**
 * Action to set available audio languages for the current video
 * Also automatically selects the best audio language based on user preferences
 */
interface SetVideoAudioLanguagesAction {
  type: 'SetVideoAudioLanguages'
  /** Available audio languages for the current video */
  videoAudioLanguages: AudioLanguage[]
}

/**
 * Action to set available subtitle languages for the current video
 * Also automatically determines if subtitles should be enabled based on availability
 */
interface SetVideoSubtitleLanguagesAction {
  type: 'SetVideoSubtitleLanguages'
  /** Available subtitle languages for the current video */
  videoSubtitleLanguages: SubtitleLanguage[]
}

/**
 * Action to set the current video being watched
 */
interface SetCurrentVideoAction {
  type: 'SetCurrentVideo'
  /** Video ID to set */
  videoId?: string
  /** Video variant slug to set */
  videoVariantSlug?: string
}

/**
 * Action to set loading state
 */
interface SetLoadingAction {
  type: 'SetLoading'
  loading: boolean
}

/**
 * Action to set router instance
 */
interface SetRouterAction {
  type: 'SetRouter'
  router: NextRouter
}

/**
 * Action to update site language with automatic cascading and page reload
 */
interface UpdateSiteLanguageAction {
  type: 'UpdateSiteLanguage'
  language: string
}

/**
 * Action to update audio language with automatic cascading and page reload
 */
interface UpdateAudioLanguageAction {
  type: 'UpdateAudioLanguage'
  languageId: string
}

/**
 * Action to update subtitle language (no page reload)
 */
interface UpdateSubtitleLanguageAction {
  type: 'UpdateSubtitleLanguage'
  languageId: string
}

/**
 * Action to update subtitles on/off setting (no page reload)
 */
interface UpdateSubtitlesOnAction {
  type: 'UpdateSubtitlesOn'
  enabled: boolean
}

/**
 * Actions for controlling the video player state
 */

/**
 * Action to set the player's playing state.
 */
interface SetPlayerPlayAction {
  type: 'SetPlayerPlay'
  /** Whether the video should be playing. */
  play: boolean
}

/**
 * Action to set the player's active state.
 */
interface SetPlayerActiveAction {
  type: 'SetPlayerActive'
  /** Whether the player controls are active/visible. */
  active: boolean
}

/**
 * Action to set the current playback time.
 */
interface SetPlayerCurrentTimeAction {
  type: 'SetPlayerCurrentTime'
  /** The current time as a formatted string (e.g., '1:23'). */
  currentTime: string
}

/**
 * Action to set the playback progress.
 */
interface SetPlayerProgressAction {
  type: 'SetPlayerProgress'
  /** The playback progress as a percentage (0-100). */
  progress: number
}

/**
 * Action to set the player's volume.
 */
interface SetPlayerVolumeAction {
  type: 'SetPlayerVolume'
  /** The volume level (0-1). */
  volume: number
}

/**
 * Action to set the player's mute state.
 */
interface SetPlayerMuteAction {
  type: 'SetPlayerMute'
  /** Whether the player is muted. */
  mute: boolean
}

/**
 * Action to set the player's fullscreen state.
 */
interface SetPlayerFullscreenAction {
  type: 'SetPlayerFullscreen'
  /** Whether the player is in fullscreen mode. */
  fullscreen: boolean
}

/**
 * Action to open or close the subtitle selection dialog.
 */
interface SetPlayerOpenSubtitleDialogAction {
  type: 'SetPlayerOpenSubtitleDialog'
  /** Whether the subtitle dialog should be open. */
  openSubtitleDialog: boolean
}

/**
 * Action to set the loading state for the subtitle dialog.
 */
interface SetPlayerLoadSubtitleDialogAction {
  type: 'SetPlayerLoadSubtitleDialog'
  /** Whether the subtitle dialog is loading content. */
  loadSubtitleDialog: boolean
}

/**
 * Action to set the player's loading state.
 */
interface SetPlayerLoadingAction {
  type: 'SetPlayerLoading'
  /** Whether the player is in a loading state. */
  loading: boolean
}

/**
 * Action to set the total duration of the video in seconds.
 */
interface SetPlayerDurationSecondsAction {
  type: 'SetPlayerDurationSeconds'
  /** The total duration in seconds. */
  durationSeconds: number
}

/**
 * Action to set the total duration of the video as a formatted string.
 */
interface SetPlayerDurationAction {
  type: 'SetPlayerDuration'
  /** The total duration as a formatted string (e.g., '10:00'). */
  duration: string
}

/**
 * Action to update the list of progress percentages that have not yet been emitted.
 */
interface SetPlayerProgressPercentNotYetEmittedAction {
  type: 'SetPlayerProgressPercentNotYetEmitted'
  /** An array of progress percentages (e.g., [10, 25, 50, 75, 90]). */
  progressPercentNotYetEmitted: number[]
}

/**
 * Union type of all possible actions for the watch context
 */
export type WatchAction =
  | SetLanguagePreferencesAction
  | SetAllLanguagesAction
  | SetVideoAudioLanguagesAction
  | SetVideoSubtitleLanguagesAction
  | SetCurrentVideoAction
  | SetLoadingAction
  | SetRouterAction
  | UpdateSiteLanguageAction
  | UpdateAudioLanguageAction
  | UpdateSubtitleLanguageAction
  | UpdateSubtitlesOnAction
  | SetPlayerPlayAction
  | SetPlayerActiveAction
  | SetPlayerCurrentTimeAction
  | SetPlayerProgressAction
  | SetPlayerVolumeAction
  | SetPlayerMuteAction
  | SetPlayerFullscreenAction
  | SetPlayerOpenSubtitleDialogAction
  | SetPlayerLoadSubtitleDialogAction
  | SetPlayerLoadingAction
  | SetPlayerDurationSecondsAction
  | SetPlayerDurationAction
  | SetPlayerProgressPercentNotYetEmittedAction

/**
 * Initial state type for WatchProvider - contains the core fields required for initialization
 */
export type WatchInitialState = Pick<
  WatchState,
  | 'siteLanguage'
  | 'audioLanguage'
  | 'subtitleLanguage'
  | 'subtitleOn'
  | 'videoId'
  | 'videoVariantSlug'
>

const WatchContext = createContext<{
  state: WatchState
  dispatch: Dispatch<WatchAction>
}>({
  state: {
    siteLanguage: 'en',
    audioLanguage: '529',
    subtitleLanguage: '529',
    subtitleOn: false,
    loading: false,
    player: videoPlayerInitialState
  },
  dispatch: () => null
})

/**
 * Reducer function for managing watch context state
 * Handles all language-related actions and maintains derived state
 *
 * **Note**: This reducer is pure and contains no side effects.
 * Side effects should be handled by components using this context.
 *
 * @param state - Current watch state
 * @param action - Action to process
 * @returns Updated watch state
 */
export const reducer = (state: WatchState, action: WatchAction): WatchState => {
  switch (action.type) {
    case 'SetLanguagePreferences':
      return {
        ...state,
        siteLanguage: action.siteLanguage ?? state.siteLanguage,
        audioLanguage: action.audioLanguage ?? state.audioLanguage,
        subtitleLanguage: action.subtitleLanguage ?? state.subtitleLanguage,
        subtitleOn: action.subtitleOn ?? state.subtitleOn
      }
    case 'SetAllLanguages':
      return {
        ...state,
        allLanguages: action.allLanguages
      }
    case 'SetVideoAudioLanguages': {
      const videoAudioLanguages = action.videoAudioLanguages

      // Find the best matching audio language for the current user preference
      let currentAudioLanguage: AudioLanguage | undefined

      // Check if user's audio preference is available for this video
      for (const lang of videoAudioLanguages) {
        const siteLanguageMapping = LANGUAGE_MAPPINGS[state.siteLanguage]
        const siteLanguageSlugs = siteLanguageMapping?.languageSlugs || []
        if (
          lang.language.id === state.audioLanguage ||
          siteLanguageSlugs.includes(lang.slug || '')
        ) {
          currentAudioLanguage = lang
          break
        }
      }

      // If no matches found, currentAudioLanguage remains undefined

      return {
        ...state,
        videoAudioLanguages,
        currentAudioLanguage
      }
    }
    case 'SetVideoSubtitleLanguages': {
      const videoSubtitleLanguages = action.videoSubtitleLanguages

      // Check if user's subtitle preference is available
      const subtitleAvailable = videoSubtitleLanguages.some(
        (subtitle) => subtitle.language.id === state.subtitleLanguage
      )

      return {
        ...state,
        videoSubtitleLanguages,
        currentSubtitleOn: subtitleAvailable
      }
    }
    case 'SetCurrentVideo':
      return {
        ...state,
        videoId: action.videoId,
        videoVariantSlug: action.videoVariantSlug
      }
    case 'SetLoading':
      return {
        ...state,
        loading: action.loading
      }
    case 'SetRouter':
      return {
        ...state,
        router: action.router
      }
    case 'UpdateSiteLanguage': {
      const newLanguage = action.language

      // Find matching language object for cascading
      const selectedLangObj = state.allLanguages?.find(
        (lang) => lang.bcp47 === newLanguage
      )

      const newAudioLanguage = selectedLangObj?.id ?? state.audioLanguage
      const newSubtitleLanguage = selectedLangObj?.id ?? state.subtitleLanguage

      // Pure state update - no side effects
      return {
        ...state,
        loading: true,
        siteLanguage: newLanguage,
        audioLanguage: newAudioLanguage,
        subtitleLanguage: newSubtitleLanguage
      }
    }
    case 'UpdateAudioLanguage': {
      const newAudioLanguage = action.languageId

      // Pure state update - no side effects
      return {
        ...state,
        loading: true,
        audioLanguage: newAudioLanguage,
        subtitleLanguage: newAudioLanguage
      }
    }
    case 'UpdateSubtitleLanguage': {
      const newSubtitleLanguage = action.languageId

      // Pure state update - no side effects
      return {
        ...state,
        subtitleLanguage: newSubtitleLanguage
      }
    }
    case 'UpdateSubtitlesOn': {
      const newSubtitlesOn = action.enabled

      // Pure state update - no side effects
      return {
        ...state,
        subtitleOn: newSubtitlesOn
      }
    }
    // Video Player Actions
    case 'SetPlayerPlay':
      return { ...state, player: { ...state.player, play: action.play } }
    case 'SetPlayerActive':
      return { ...state, player: { ...state.player, active: action.active } }
    case 'SetPlayerCurrentTime':
      return {
        ...state,
        player: { ...state.player, currentTime: action.currentTime }
      }
    case 'SetPlayerProgress':
      return {
        ...state,
        player: { ...state.player, progress: action.progress }
      }
    case 'SetPlayerVolume':
      return { ...state, player: { ...state.player, volume: action.volume } }
    case 'SetPlayerMute':
      return { ...state, player: { ...state.player, mute: action.mute } }
    case 'SetPlayerFullscreen':
      return {
        ...state,
        player: { ...state.player, fullscreen: action.fullscreen }
      }
    case 'SetPlayerOpenSubtitleDialog':
      return {
        ...state,
        player: {
          ...state.player,
          openSubtitleDialog: action.openSubtitleDialog
        }
      }
    case 'SetPlayerLoadSubtitleDialog':
      return {
        ...state,
        player: {
          ...state.player,
          loadSubtitleDialog: action.loadSubtitleDialog
        }
      }
    case 'SetPlayerLoading':
      return {
        ...state,
        player: { ...state.player, loading: action.loading }
      }
    case 'SetPlayerDurationSeconds':
      return {
        ...state,
        player: { ...state.player, durationSeconds: action.durationSeconds }
      }
    case 'SetPlayerDuration':
      return {
        ...state,
        player: { ...state.player, duration: action.duration }
      }
    case 'SetPlayerProgressPercentNotYetEmitted':
      return {
        ...state,
        player: {
          ...state.player,
          progressPercentNotYetEmitted: action.progressPercentNotYetEmitted
        }
      }
  }
}

/**
 * Props for the WatchProvider component
 */
interface WatchProviderProps {
  /** Child components that will have access to the watch context */
  children: React.ReactNode
  /** Initial state for the watch context */
  initialState: WatchInitialState
}

/**
 * Provider component for watch context
 * Manages language preferences, video-specific language data, and automatic language selection
 *
 * @example
 * ```tsx
 * <WatchProvider initialState={initialWatchState}>
 *   <VideoPlayer />
 * </WatchProvider>
 * ```
 */
export function WatchProvider({ children, initialState }: WatchProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    loading: false,
    player: videoPlayerInitialState
  })
  return (
    <WatchContext.Provider value={{ state, dispatch }}>
      {children}
    </WatchContext.Provider>
  )
}

/**
 * Hook to access watch context
 * Provides access to watch state and dispatch function for managing watch preferences
 *
 * @returns Object containing watch state and dispatch function
 * @throws Error if used outside of WatchProvider
 *
 * @example
 * ```tsx
 * function VideoControls() {
 *   const { state, dispatch } = useWatch()
 *
 *   const handleLanguageChange = (language: string) => {
 *     dispatch({
 *       type: 'SetLanguagePreferences',
 *       siteLanguage: language
 *     })
 *   }
 *
 *   return <div>Current language: {state.siteLanguage}</div>
 * }
 * ```
 */
export function useWatch(): {
  state: WatchState
  dispatch: Dispatch<WatchAction>
} {
  const context = useContext(WatchContext)

  if (context === undefined) {
    throw new Error('useWatch must be used within a WatchProvider')
  }

  return context
}
