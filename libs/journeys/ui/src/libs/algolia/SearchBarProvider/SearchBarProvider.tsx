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

import {
  Continent,
  Language
} from '../../useLanguagesContinentsQuery/sortLanguageContinents'

export interface SearchBarState {
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

interface RemoveAllLanguageContinentsAction {
  type: 'RemoveAllLanguageContinents'
}

type SearchBarAction =
  | SelectLanguageContinentAction
  | SetDefaultLanguageContinentAction
  | RemoveLanguageContinentsAction
  | RemoveAllLanguageContinentsAction

function selectLanguageContinent(
  state: SearchBarState,
  action: SelectLanguageContinentAction
): SearchBarState {
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

function setDefaultLanguageContinent(
  state: SearchBarState,
  action: SetDefaultLanguageContinentAction
): SearchBarState {
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

function removeLanguageContinents(
  state: SearchBarState,
  action: RemoveLanguageContinentsAction
): SearchBarState {
  const { language } = action
  const updatedLanguages = mapValues(state.continentLanguages, (languages) =>
    filter(languages, (lang) => lang !== language)
  )
  return {
    ...state,
    continentLanguages: updatedLanguages
  }
}

function removeAllLanguageContinents(state: SearchBarState): SearchBarState {
  return {
    ...state,
    continentLanguages: {}
  }
}

export const reducer = (
  state: SearchBarState,
  action: SearchBarAction
): SearchBarState => {
  switch (action.type) {
    case 'SelectLanguageContinent':
      return selectLanguageContinent(state, action)
    case 'SetDefaultLanguageContinent':
      return setDefaultLanguageContinent(state, action)
    case 'RemoveLanguageContinents':
      return removeLanguageContinents(state, action)
    case 'RemoveAllLanguageContinents':
      return removeAllLanguageContinents(state)
    default:
      return state
  }
}

interface SearchBarContextType {
  state: SearchBarState
  dispatch: Dispatch<SearchBarAction>
}

const SearchBarContext = createContext<SearchBarContextType | undefined>(
  undefined
)

interface SearchBarProviderProps {
  children: ReactNode
  initialState?: Partial<SearchBarState>
}

export function SearchBarProvider({
  children,
  initialState
}: SearchBarProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    continentLanguages: {},
    ...initialState
  })

  return (
    <SearchBarContext.Provider
      value={{
        state,
        dispatch
      }}
    >
      {children}
    </SearchBarContext.Provider>
  )
}

export function useSearchBar(): SearchBarContextType {
  const context = useContext(SearchBarContext)
  if (context === undefined) {
    throw new Error('useSearchBar must be used within a SearchBarProvider')
  }
  return context
}
