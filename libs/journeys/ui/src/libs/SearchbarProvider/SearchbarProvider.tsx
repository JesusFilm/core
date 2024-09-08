import filter from 'lodash/filter'
import mapValues from 'lodash/mapValues'
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

interface SelectLanguageContinentAction {
  type: 'SelectLanguageContinent'
  continent: Continent
  language: Language
  isSelected: boolean
}

interface SetDefaultLanguageContinentAction {
  type: 'SetDefaultLanguageContinent'
  continents: Record<Continent, Language[]>
  refinedItems: string[]
}

interface RemoveLanguageContinentsAction {
  type: 'RemoveLanguageContinents'
  language: Language
}

type SearchbarAction =
  | SelectLanguageContinentAction
  | SetDefaultLanguageContinentAction
  | RemoveLanguageContinentsAction

const searchbarReducer = (
  state: SearchbarState,
  action: SearchbarAction
): SearchbarState => {
  switch (action.type) {
    case 'SelectLanguageContinent': {
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
    case 'SetDefaultLanguageContinent': {
      const { continents, refinedItems } = action

      const updatedContinentLanguages = refinedItems.reduce(
        (acc, item) => {
          const continent = Object.keys(continents).find((continent) =>
            continents[continent].includes(item)
          )

          if (continent != null) {
            if (!(continent in acc)) {
              acc[continent] = []
            }
            if (!acc[continent].includes(item)) {
              acc[continent] = [...acc[continent], item]
            }
          }

          return acc
        },
        { ...state.continentLanguages }
      )

      if (Object.keys(updatedContinentLanguages).length > 0) {
        return {
          ...state,
          continentLanguages: updatedContinentLanguages
        }
      }

      return state
    }
    case 'RemoveLanguageContinents': {
      const { language } = action
      const updatedLanguages = mapValues(
        state.continentLanguages,
        (languages) => filter(languages, (lang) => lang !== language)
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

  return (
    <SearchbarContext.Provider
      value={{
        state,
        dispatch
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
