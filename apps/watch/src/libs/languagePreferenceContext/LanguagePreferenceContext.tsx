import { Dispatch, createContext, useContext, useReducer } from 'react'

import { GetAllLanguages_languages as Language } from '../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug_video_variantLanguagesWithSlug_language as AudioLanguage } from '../../../__generated__/GetLanguagesSlug'
import { GetSubtitles_video_variant_subtitle_language as SubtitleLanguage } from '../../../__generated__/GetSubtitles'

/**
 * State interface for language preferences and video-specific language data
 */
interface LanguageState {
  /** Current site/UI language (e.g., 'en', 'es') */
  siteLanguage: string
  /** User's preferred audio language ID */
  audioLanguage: string
  /** User's preferred subtitle language ID */
  subtitleLanguage: string
  /** Whether subtitles are enabled by user preference */
  subtitleOn: boolean
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
 * Union type of all possible actions for the language preference context
 */
export type LanguageAction =
  | SetLanguagePreferencesAction
  | SetAllLanguagesAction
  | SetVideoAudioLanguagesAction
  | SetVideoSubtitleLanguagesAction

const LanguageContext = createContext<{
  state: LanguageState
  dispatch: Dispatch<LanguageAction>
}>({
  state: {
    siteLanguage: 'en',
    audioLanguage: 'english',
    subtitleLanguage: 'english',
    subtitleOn: false
  },
  dispatch: () => null
})

/**
 * Reducer function for managing language preference state
 * Handles all language-related actions and maintains derived state
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
      let selectedAudioLanguage: AudioLanguage | undefined

      if (videoAudioLanguages.length > 0) {
        let siteLanguageMatch: AudioLanguage | undefined
        let englishMatch: AudioLanguage | undefined

        // Single loop through array checking all conditions
        for (const lang of videoAudioLanguages) {
          // Priority 1: Match audioLanguage (by ID) - return immediately
          if (lang.id === state.audioLanguage) {
            selectedAudioLanguage = lang
            break
          }

          // Priority 2: Match siteLanguage (by slug) - store but continue
          if (!siteLanguageMatch && lang.slug === state.siteLanguage) {
            siteLanguageMatch = lang
          }

          // Priority 3: Match English - store but continue
          if (
            !englishMatch &&
            (lang.slug === 'en' || lang.slug?.startsWith('en-'))
          ) {
            englishMatch = lang
          }
        }

        // Use fallback priority if no exact audioLanguage match
        if (!selectedAudioLanguage) {
          selectedAudioLanguage =
            siteLanguageMatch || englishMatch || videoAudioLanguages[0]
        }
      }

      return {
        ...state,
        videoAudioLanguages,
        currentAudioLanguage: selectedAudioLanguage
      }
    }
    case 'SetVideoSubtitleLanguages': {
      const videoSubtitleLanguages = action.videoSubtitleLanguages

      // Check if user's subtitle preference is available
      const subtitleAvailable = videoSubtitleLanguages.some(
        (lang) => lang.id === state.subtitleLanguage
      )

      return {
        ...state,
        videoSubtitleLanguages,
        currentSubtitleOn: subtitleAvailable
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
  const [state, dispatch] = useReducer(reducer, { ...initialState })
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
