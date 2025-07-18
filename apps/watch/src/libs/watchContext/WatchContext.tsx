import { NextRouter } from 'next/router'
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer
} from 'react'

import { GetAllLanguages_languages as Language } from '../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug_video_variantLanguagesWithSlug as AudioLanguage } from '../../../__generated__/GetLanguagesSlug'
import { GetSubtitles_video_variant_subtitle as SubtitleLanguage } from '../../../__generated__/GetSubtitles'
import { LANGUAGE_MAPPINGS } from '../localeMapping'

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
  /** Currently selected audio track for the video object (based on availability and preferences) */
  currentAudioLanguage?: AudioLanguage
  /** Whether subtitles should be enabled (calculation based on if the user's subtitle preference is met but the audio track is not met) */
  autoSubtitle?: boolean
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
  | UpdateSiteLanguageAction
  | UpdateAudioLanguageAction
  | UpdateSubtitleLanguageAction
  | UpdateSubtitlesOnAction
  | UpdateAutoSubtitlesOnAction

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
  | 'videoSubtitleLanguages'
  | 'videoAudioLanguages'
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

      const langPrefMet =
        state?.audioLanguage === state?.currentAudioLanguage?.language.id

      if (langPrefMet) {
        return {
          ...state,
          videoSubtitleLanguages
        }
      }

      // Check if user's subtitle preference is available
      const subtitleAvailable = videoSubtitleLanguages.some(
        (subtitle) => subtitle.language.id === state.subtitleLanguage
      )

      return {
        ...state,
        videoSubtitleLanguages,
        autoSubtitle: subtitleAvailable
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

      return {
        ...state,
        loading: true,
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
    //video audio languages needs to be set first for the auto subtitle calculation
    dispatch({
      type: 'SetVideoAudioLanguages',
      videoAudioLanguages: initialState?.videoAudioLanguages ?? []
    })
    dispatch({
      type: 'SetVideoSubtitleLanguages',
      videoSubtitleLanguages: initialState?.videoSubtitleLanguages ?? []
    })
  }, [initialState.videoSubtitleLanguages, initialState.videoAudioLanguages])

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
