import { NextRouter } from 'next/router'
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer
} from 'react'

import { LANGUAGE_MAPPINGS } from '../localeMapping'

import { initializeVideoLanguages } from './initializeVideoLanguages'

export interface AudioLanguageData {
  id: string
  slug: string | null
}

export interface LanguageName {
  primary: boolean
  value: string
}

export interface Language {
  id: string
  slug: string | null
  name: LanguageName[]
}

/**
 * State interface for watch context containing language preferences and video-specific data
 */
export interface WatchState {
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
  /** Available audio languages for the current video (clean structure with id and slug only) */
  videoAudioLanguagesIdsAndSlugs?: AudioLanguageData[]
  /** Available subtitle language IDs for the current video */
  videoSubtitleLanguageIds?: string[]
  /** Currently selected audio track for the video object (based on availability and preferences) */
  currentAudioLanguage?: AudioLanguageData
  /** Whether subtitles should be enabled (calculation based on if the user's subtitle preference is met but the audio track is not met) */
  autoSubtitle?: boolean
}

/**
 * Action to update user language preferences
 * Can update multiple preferences at once - only provided fields will be updated
 */
interface SetLanguagePreferencesAction {
  type: 'SetLanguagePreferences'
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
  /** Available audio languages for the current video id and slug only */
  videoAudioLanguagesIdsAndSlugs: AudioLanguageData[]
}

/**
 * Action to set available subtitle languages for the current video
 * Also automatically determines if subtitles should be enabled based on availability
 */
interface SetVideoSubtitleLanguagesAction {
  type: 'SetVideoSubtitleLanguages'
  /** Available subtitle language IDs for the current video */
  videoSubtitleLanguageIds: string[]
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
 * Action to update auto subtitles on/off setting (no page reload)
 */
interface UpdateAutoSubtitlesOnAction {
  type: 'UpdateAutoSubtitlesOn'
  autoSubtitle: boolean
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
  | UpdateAudioLanguageAction
  | UpdateSubtitleLanguageAction
  | UpdateSubtitlesOnAction
  | UpdateAutoSubtitlesOnAction

/**
 * Initial state type for WatchProvider - contains the core fields required for initialization
 */
export type WatchInitialState = Pick<
  WatchState,
  | 'audioLanguage'
  | 'subtitleLanguage'
  | 'subtitleOn'
  | 'videoId'
  | 'videoVariantSlug'
  | 'videoSubtitleLanguageIds'
  | 'videoAudioLanguagesIdsAndSlugs'
>

const WatchContext = createContext<{
  state: WatchState
  dispatch: Dispatch<WatchAction>
}>({
  state: {
    audioLanguage: '529',
    subtitleLanguage: '529',
    subtitleOn: false,
    loading: false
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
      const videoAudioLanguagesIdsAndSlugs =
        action.videoAudioLanguagesIdsAndSlugs

      // Find the best matching audio language for the current user preference
      let currentAudioLanguage: AudioLanguageData | undefined

      // Check if user's audio preference is available for this video
      for (const lang of videoAudioLanguagesIdsAndSlugs) {
        if (
          lang.id === state.audioLanguage ||
          lang.slug === state.audioLanguage
        ) {
          currentAudioLanguage = lang
          break
        }
      }

      // If no matches found, currentAudioLanguage remains undefined
      return {
        ...state,
        videoAudioLanguagesIdsAndSlugs,
        currentAudioLanguage
      }
    }
    case 'SetVideoSubtitleLanguages': {
      const videoSubtitleLanguageIds = action.videoSubtitleLanguageIds

      const langPrefMet =
        state?.audioLanguage === state?.currentAudioLanguage?.id

      if (langPrefMet) {
        return {
          ...state,
          videoSubtitleLanguageIds
        }
      }

      // Check if user's subtitle preference is available
      const subtitleAvailable = videoSubtitleLanguageIds.some(
        (languageId) => languageId === state.subtitleLanguage
      )

      return {
        ...state,
        videoSubtitleLanguageIds,
        autoSubtitle: subtitleAvailable === false ? undefined : true
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
    case 'UpdateAudioLanguage': {
      const newAudioLanguage = action.languageId

      return {
        ...state,
        audioLanguage: newAudioLanguage,
        subtitleLanguage: newAudioLanguage
      }
    }
    case 'UpdateSubtitleLanguage': {
      const newSubtitleLanguage = action.languageId

      return {
        ...state,
        subtitleLanguage: newSubtitleLanguage
      }
    }
    case 'UpdateSubtitlesOn': {
      const newSubtitlesOn = action.enabled

      return {
        ...state,
        subtitleOn: newSubtitlesOn
      }
    }
    case 'UpdateAutoSubtitlesOn': {
      return {
        ...state,
        autoSubtitle: action.autoSubtitle
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
    loading: false
  })

  useEffect(() => {
    // Initialize video language preferences based on available languages
    initializeVideoLanguages(
      dispatch,
      initialState?.videoAudioLanguagesIdsAndSlugs ?? [],
      initialState?.videoSubtitleLanguageIds ?? []
    )
  }, [
    initialState.videoSubtitleLanguageIds,
    initialState.videoAudioLanguagesIdsAndSlugs
  ])

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
 *       audioLanguage: language
 *     })
 *   }
 *
 *   return <div>Current language: {state.audioLanguage}</div>
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
