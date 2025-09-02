import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer
} from 'react'

export interface AudioLanguageData {
  id: string
  slug: string | null
}

export interface LanguageName {
  id: string
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
  audioLanguageId?: string
  /** User's preferred subtitle language ID (e.g., '529')*/
  subtitleLanguageId?: string
  /** Whether subtitles are enabled by user preference */
  subtitleOn?: boolean
  /** Available audio language IDs for the current video */
  videoAudioLanguageIds?: string[]
  /** Available subtitle language IDs for the current video */
  videoSubtitleLanguageIds?: string[]
}

/**
 * Action to update user language preferences
 * Can update multiple preferences at once - only provided fields will be updated
 */
interface SetLanguagePreferencesAction {
  type: 'SetLanguagePreferences'
  /** Audio language preference to set */
  audioLanguageId?: string
  /** Subtitle language preference to set */
  subtitleLanguageId?: string
  /** Subtitle enabled preference to set */
  subtitleOn?: boolean
}

/**
 * Action to set available audio languages for the current video
 */
interface SetVideoAudioLanguageIdsAction {
  type: 'SetVideoAudioLanguageIds'
  /** Available audio language IDs for the current video */
  videoAudioLanguageIds: string[]
}

/**
 * Action to set available subtitle languages for the current video
 * Also automatically determines if subtitles should be enabled based on availability
 */
interface SetVideoSubtitleLanguageIdsAction {
  type: 'SetVideoSubtitleLanguageIds'
  /** Available subtitle language IDs for the current video */
  videoSubtitleLanguageIds: string[]
}

/**
 * Union type of all possible actions for the watch context
 */
export type WatchAction =
  | SetLanguagePreferencesAction
  | SetVideoAudioLanguageIdsAction
  | SetVideoSubtitleLanguageIdsAction

const WatchContext = createContext<{
  state: WatchState
  dispatch: Dispatch<WatchAction>
}>({
  state: {
    audioLanguageId: '529',
    subtitleLanguageId: '529'
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
        audioLanguageId: action.audioLanguageId ?? state.audioLanguageId,
        subtitleLanguageId:
          action.subtitleLanguageId ?? state.subtitleLanguageId,
        subtitleOn: action.subtitleOn ?? state.subtitleOn
      }
    case 'SetVideoAudioLanguageIds': {
      return {
        ...state,
        videoAudioLanguageIds: action.videoAudioLanguageIds
      }
    }
    case 'SetVideoSubtitleLanguageIds': {
      return {
        ...state,
        videoSubtitleLanguageIds: action.videoSubtitleLanguageIds
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
  initialState?: WatchState
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
export function WatchProvider({
  children,
  initialState = {}
}: WatchProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (initialState?.videoAudioLanguageIds != null)
      dispatch({
        type: 'SetVideoAudioLanguageIds',
        videoAudioLanguageIds: initialState.videoAudioLanguageIds
      })
    if (initialState?.videoSubtitleLanguageIds != null)
      dispatch({
        type: 'SetVideoSubtitleLanguageIds',
        videoSubtitleLanguageIds: initialState.videoSubtitleLanguageIds
      })
  }, [
    initialState.videoSubtitleLanguageIds,
    initialState.videoAudioLanguageIds
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
