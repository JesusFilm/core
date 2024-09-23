import { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import filter from 'lodash/filter'
import mapValues from 'lodash/mapValues'
import {
  Dispatch,
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer
} from 'react'
import { UseRefinementListProps, useRefinementList } from 'react-instantsearch'

export type Continent = string
export type Language = string

export interface SearchBarState {
  /**
   * selected languages sorted by continent
   */
  continentLanguages: Record<Continent, Language[]>
  allContinentLanguages: Record<Continent, Language[]>
}

interface SetAllContinentLanguagesAction {
  type: 'SetAllContinentLanguages'
  allContinentLanguages: Record<Continent, Language[]>
}

interface SelectLanguageContinentAction {
  type: 'SelectLanguageContinent'
  continent: Continent
  language: Language
  isSelected: boolean
}

interface SetDefaultLanguageContinentAction {
  type: 'SetDefaultLanguageContinent'
  refinedItems: string[]
}

interface RemoveLanguageContinentsAction {
  type: 'RemoveLanguageContinents'
  languages: Language[]
}

interface RemoveAllLanguageContinentsAction {
  type: 'RemoveAllLanguageContinents'
}

type SearchBarAction =
  | SetAllContinentLanguagesAction
  | SelectLanguageContinentAction
  | SetDefaultLanguageContinentAction
  | RemoveLanguageContinentsAction
  | RemoveAllLanguageContinentsAction

function setAllContinentLanguages(
  state: SearchBarState,
  action: SetAllContinentLanguagesAction
): SearchBarState {
  const { allContinentLanguages } = action
  return {
    ...state,
    allContinentLanguages
  }
}

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
  const { allContinentLanguages } = state
  const { refinedItems } = action

  if (Object.keys(allContinentLanguages).length === 0) {
    console.warn(
      'Provider has not yet recieved all continent languages! Unable to set languages.'
    )
    return state
  }

  const updatedContinentLanguages = refinedItems.reduce(
    (acc, item) => {
      const continent = Object.keys(allContinentLanguages).find((continent) =>
        allContinentLanguages[continent].includes(item)
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
  const { languages } = action
  const updatedLanguages = mapValues(
    state.continentLanguages,
    (continentLanguage) =>
      filter(continentLanguage, (lang) => !languages.includes(lang))
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
    case 'SetAllContinentLanguages':
      return setAllContinentLanguages(state, action)
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

export interface SearchBarContextType {
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

export const languageRefinementProps: UseRefinementListProps = {
  attribute: 'languageEnglishName',
  showMore: true,
  limit: 1000,
  showMoreLimit: 5000
}

export function SearchBarProvider({
  children,
  initialState
}: SearchBarProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    continentLanguages: {},
    allContinentLanguages: {},
    ...initialState
  })

  const { items } = useRefinementList(languageRefinementProps)

  const updateLanguages = useCallback(() => {
    const refinedItems = items.filter((item) => item.isRefined)
    const languagesSet = Object.values(state.continentLanguages).flat()
    if (languagesSet.length < refinedItems.length) {
      setLanguages(refinedItems, languagesSet)
    }
    if (languagesSet.length > refinedItems.length) {
      unsetLanguages(refinedItems, languagesSet)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  useEffect(() => {
    updateLanguages()
  }, [updateLanguages])

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

  function setLanguages(
    refinedItems: RefinementListItem[],
    languagesSet: Language[]
  ): void {
    const languagesNotSet = refinedItems
      .map((item) => item.label)
      .filter((language) => !languagesSet.includes(language))
    dispatch({
      type: 'SetDefaultLanguageContinent',
      refinedItems: languagesNotSet
    })
  }

  function unsetLanguages(
    refinedItems: RefinementListItem[],
    languagesSet: Language[]
  ): void {
    const refinedItemsLabels = refinedItems.map((item) => item.label)
    const languagesToUnset = languagesSet.filter(
      (language) => !refinedItemsLabels.includes(language)
    )
    dispatch({
      type: 'RemoveLanguageContinents',
      languages: languagesToUnset
    })
  }
}

export function useSearchBar(): SearchBarContextType {
  const context = useContext(SearchBarContext)
  if (context === undefined) {
    throw new Error('useSearchBar must be used within a SearchBarProvider')
  }
  return context
}
