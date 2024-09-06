import {
  Dispatch,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useReducer
} from 'react'

type Continent = string
type Language = string

interface SearchbarState {
  /**
   * selected languages sorted by continent
   */
  continentLanguages: Record<Continent, Language[]>
}

interface SelectLanguageAction {
  type: 'SelectLanguage'
  continent: Continent
  language: Language
  isSelected: boolean
}

interface RemoveLanguageAction {
  type: 'RemoveLanguage'
  language: Language
}

type SearchbarAction = SelectLanguageAction | RemoveLanguageAction

const searchbarReducer = (
  state: SearchbarState,
  action: SearchbarAction
): SearchbarState => {
  switch (action.type) {
    case 'SelectLanguage': {
      const { continent, language, isSelected } = action
      const currentLanguages = state.continentLanguages[continent] ?? []
      const updatedLanguages = isSelected
        ? [...currentLanguages, language]
        : currentLanguages.filter((lang) => lang !== language)
      return {
        ...state,
        continentLanguages: {
          ...state.continentLanguages,
          [continent]: updatedLanguages
        }
      }
    }
    case 'RemoveLanguage': {
      const { language } = action
      const languageEntries = Object.entries(state.continentLanguages)
      const updatedLanguages = languageEntries.reduce(
        (acc, [continent, languages]) => ({
          ...acc,
          [continent]: languages.filter((lang) => lang !== language)
        }),
        {}
      )
      return {
        ...state,
        continentLanguages: updatedLanguages
      }
    }
    default:
      return state
  }
}

interface SearchbarContextType {
  state: SearchbarState
  dispatch: Dispatch<SearchbarAction>
  /**
   * Select a language for a continent
   */
  selectLanguage: (
    continent: Continent,
    language: Language,
    isSelected: boolean
  ) => void
  /**
   * Remove a language from all continents
   */
  removeLanguage: (language: Language) => void
}

const SearchbarContext = createContext<SearchbarContextType | undefined>(
  undefined
)

interface SearchbarProviderProps {
  children: ReactNode
  initialState?: Partial<SearchbarState>
}

export function SearchbarProvider({
  children,
  initialState
}: SearchbarProviderProps): ReactElement {
  const [state, dispatch] = useReducer(searchbarReducer, {
    continentLanguages: {},
    ...initialState
  })

  function selectLanguage(
    continent: Continent,
    language: Language,
    isSelected: boolean
  ): void {
    dispatch({ type: 'SelectLanguage', continent, language, isSelected })
  }

  function removeLanguage(language: Language): void {
    dispatch({ type: 'RemoveLanguage', language })
  }

  return (
    <SearchbarContext.Provider
      value={{
        state,
        dispatch,
        selectLanguage,
        removeLanguage
      }}
    >
      {children}
    </SearchbarContext.Provider>
  )
}

export function useSearchbar(): SearchbarContextType {
  const context = useContext(SearchbarContext)
  if (context === undefined) {
    throw new Error('useSearchbar must be used within a SearchbarProvider')
  }
  return context
}
