import { NextRouter } from 'next/router'
import { Dispatch, createContext, useContext, useReducer } from 'react'

import { GetAllLanguages_languages as Language } from '../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug_video_variantLanguagesWithSlug as AudioLanguage } from '../../../__generated__/GetLanguagesSlug'
import { GetSubtitles_video_variant_subtitle as SubtitleLanguage } from '../../../__generated__/GetSubtitles'
import { LANGUAGE_MAPPINGS } from '../../config/locales'

/**
 * State interface for language preferences and video-specific language data
 */
export interface LanguageState {
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
 * Union type of all possible actions for the language preference context
 */
export type LanguageAction =
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

const LanguageContext = createContext<{
  state: LanguageState
  dispatch: Dispatch<LanguageAction>
}>({
  state: {
    siteLanguage: 'en',
    audioLanguage: 'english',
    subtitleLanguage: 'english',
    subtitleOn: false,
    loading: false
  },
  dispatch: () => null
})

/**
 * Reducer function for managing language preference state
 * Handles all language-related actions and maintains derived state
 *
 * **Note**: This reducer is pure and contains no side effects.
 * Side effects are handled by the useLanguageActions hook.
 *
 * @param state - Current language state
 * @param action - Action to process
 * @returns Updated language state
 */
const reducer = (
  state: LanguageState,
  action: LanguageAction
): LanguageState => {
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
    default:
      return state
  }
}

/**
 * Props for the LanguagePreferenceProvider component
 */
interface LanguagePreferenceProviderProps {
  /** Child components that will have access to the language context */
  children: React.ReactNode
  /** Initial state for the language preferences */
  initialState: LanguageState
}

/**
 * Provider component for language preferences context
 * Manages language preferences, video-specific language data, and automatic language selection
 *
 * @example
 * ```tsx
 * <LanguagePreferenceProvider initialState={initialLanguageState}>
 *   <VideoPlayer />
 * </LanguagePreferenceProvider>
 * ```
 */
export function LanguagePreferenceProvider({
  children,
  initialState
}: LanguagePreferenceProviderProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    loading: false
  })
  return (
    <LanguageContext.Provider value={{ state, dispatch }}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * Hook to access language preference context
 * Provides access to language state and dispatch function for managing language preferences
 *
 * @returns Object containing language state and dispatch function
 * @throws Error if used outside of LanguagePreferenceProvider
 *
 * @example
 * ```tsx
 * function VideoControls() {
 *   const { state, dispatch } = useLanguagePreference()
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
export function useLanguagePreference(): {
  state: LanguageState
  dispatch: Dispatch<LanguageAction>
} {
  const context = useContext(LanguageContext)

  if (context === undefined) {
    throw new Error(
      'useLanguagePreference must be used within a LanguagePreferenceProvider'
    )
  }

  return context
}
