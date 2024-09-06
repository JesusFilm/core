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
  selectedLanguagesByContinent: Record<Continent, Language[]>
}

interface SelectLanguageAction {
  type: 'SelectLanguage'
  continent: Continent
  language: Language
  isRefined: boolean
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
      const { continent, language, isRefined } = action
      const currentLanguages =
        state.selectedLanguagesByContinent[continent] ?? []
      const updatedLanguages = isRefined
        ? [...currentLanguages, language]
        : currentLanguages.filter((lang) => lang !== language)

      return {
        ...state,
        selectedLanguagesByContinent: {
          ...state.selectedLanguagesByContinent,
          [continent]: updatedLanguages
        }
      }
    }
    case 'RemoveLanguage': {
      const { language } = action
      const updatedLanguages = Object.entries(
        state.selectedLanguagesByContinent
      ).reduce(
        (acc, [continent, languages]) => ({
          ...acc,
          [continent]: languages.filter((lang) => lang !== language)
        }),
        {}
      )

      return {
        ...state,
        selectedLanguagesByContinent: updatedLanguages
      }
    }
    default:
      return state
  }
}

interface SearchbarContextType {
  state: SearchbarState
  dispatch: Dispatch<SearchbarAction>
  selectLanguage: (
    continent: Continent,
    language: Language,
    isRefined: boolean
  ) => void
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
    selectedLanguagesByContinent: {},
    ...initialState
  })

  function selectLanguage(
    continent: Continent,
    language: Language,
    isRefined: boolean
  ): void {
    dispatch({ type: 'SelectLanguage', continent, language, isRefined })
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
