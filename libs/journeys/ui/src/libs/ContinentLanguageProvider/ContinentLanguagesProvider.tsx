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

interface ContinentLanguagesState {
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

type ContinentLanguagesAction = SelectLanguageAction | RemoveLanguageAction

const continentLanguagesReducer = (
  state: ContinentLanguagesState,
  action: ContinentLanguagesAction
): ContinentLanguagesState => {
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

interface ContinentLanguagesContextType {
  state: ContinentLanguagesState
  dispatch: Dispatch<ContinentLanguagesAction>
  selectLanguage: (
    continent: Continent,
    language: Language,
    isRefined: boolean
  ) => void
  removeLanguage: (language: Language) => void
}

const ContinentLanguagesContext = createContext<
  ContinentLanguagesContextType | undefined
>(undefined)

interface ContinentLanguagesProviderProps {
  children: ReactNode
  initialState?: Partial<ContinentLanguagesState>
}

export function ContinentLanguagesProvider({
  children,
  initialState
}: ContinentLanguagesProviderProps): ReactElement {
  const [state, dispatch] = useReducer(continentLanguagesReducer, {
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
    <ContinentLanguagesContext.Provider
      value={{
        state,
        dispatch,
        selectLanguage,
        removeLanguage
      }}
    >
      {children}
    </ContinentLanguagesContext.Provider>
  )
}

export function useContinentLanguages(): ContinentLanguagesContextType {
  const context = useContext(ContinentLanguagesContext)
  if (context === undefined) {
    throw new Error(
      'useContinentLanguages must be used within a ContinentLanguagesProvider'
    )
  }
  return context
}
