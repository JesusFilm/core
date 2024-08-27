// https://www.algolia.com/doc/ui-libraries/autocomplete/integrations/with-react-instantsearch/#using-autocomplete-as-a-search-box
import { BaseItem } from '@algolia/autocomplete-core'
import { AutocompleteOptions, autocomplete } from '@algolia/autocomplete-js'
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions'
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches'
import { SearchClient } from 'algoliasearch/lite'
import {
  Fragment,
  ReactElement,
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Root, createRoot } from 'react-dom/client'
import {
  usePagination,
  useRefinementList,
  useSearchBox
} from 'react-instantsearch'
import '@algolia/autocomplete-theme-classic'

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  searchClient: SearchClient
  className?: string
}

interface SetInstantSearchUiStateOptions {
  query: string
  category?: string
}

const INSTANT_SEARCH_INDEX_NAME = 'video-variants-stg'
const INSTANT_SEARCH_ATTRIBUTE = 'languageEnglishName'
const INSTANT_SEARCH_QUERY_SUGGESTIONS = 'video-variants-stg_query_suggestions'

export function Autocomplete({
  searchClient,
  className,
  ...autocompleteProps
}: AutocompleteProps): ReactElement {
  const autocompleteContainer = useRef<HTMLDivElement>(null)
  const panelRootRef = useRef<Root | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)

  const { query, refine: setQuery } = useSearchBox()
  const { refine: setPage } = usePagination()

  const [instantSearchUiState, setInstantSearchUiState] =
    useState<SetInstantSearchUiStateOptions>({ query })

  // Language filters
  const { items: categories, refine: setCategory } = useRefinementList({
    attribute: 'languageEnglishName'
  })

  useEffect(() => {
    setQuery(instantSearchUiState.query)
    instantSearchUiState.category && setCategory(instantSearchUiState.category)
    setPage(0)
  }, [instantSearchUiState])

  const currentCategory = useMemo(() => {
    const category = categories.find(({ isRefined }) => isRefined)
    return category && category.value
  }, [categories])

  // Configure recent searches/query suggestions/categories
  const plugins = useMemo(() => {
    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: 'instantsearch',
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.label,
              category: item.category
            })
          }
        }
      }
    })

    const querySuggestionsInCategory = createQuerySuggestionsPlugin({
      searchClient,
      indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
      getSearchParams() {
        return recentSearches.data!.getAlgoliaSearchParams({
          hitsPerPage: 3,
          facetFilters: [
            `${INSTANT_SEARCH_INDEX_NAME}.facets.exact_matches.${INSTANT_SEARCH_ATTRIBUTE}.value:${currentCategory}`
          ]
        })
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'querySuggestionsInCategoryPlugin',
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.query,
              category: item.__autocomplete_qsCategory
            })
          },
          getItems(params) {
            if (!currentCategory) {
              return []
            }

            return source.getItems(params)
          },
          templates: {
            ...source.templates,
            header({ items }) {
              if (items.length === 0) {
                return <Fragment />
              }

              return (
                <Fragment>
                  <span className="aa-SourceHeaderTitle">
                    In {currentCategory}
                  </span>
                  <span className="aa-SourceHeaderLine" />
                </Fragment>
              )
            }
          }
        }
      }
    })

    const querySuggestions = createQuerySuggestionsPlugin({
      searchClient,
      indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
      getSearchParams() {
        return recentSearches.data!.getAlgoliaSearchParams({
          hitsPerPage: 6,
          facetFilters: [
            `${INSTANT_SEARCH_INDEX_NAME}.facets.exact_matches.${INSTANT_SEARCH_ATTRIBUTE}.value:-${currentCategory}`
          ]
        })
      },
      categoryAttribute: [
        INSTANT_SEARCH_INDEX_NAME,
        'facets',
        'exact_matches',
        INSTANT_SEARCH_ATTRIBUTE
      ],
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'querySuggestionsPlugin',
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.query,
              category: item.__autocomplete_qsCategory ?? ''
            })
          },
          getItems(params) {
            if (params.state.query === '') {
              return []
            }

            return source.getItems(params)
          },
          templates: {
            ...source.templates,
            header({ items }) {
              if (!currentCategory || items.length === 0) {
                return <Fragment />
              }

              return (
                <Fragment>
                  <span className="aa-SourceHeaderTitle">
                    In other categories
                  </span>
                  <span className="aa-SourceHeaderLine" />
                </Fragment>
              )
            }
          }
        }
      }
    })
    return [recentSearches, querySuggestionsInCategory, querySuggestions]
  }, [currentCategory])

  useEffect(() => {
    setQuery(instantSearchUiState.query)
    setPage(0)
  }, [instantSearchUiState])

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      container: autocompleteContainer.current,
      initialState: { query },
      onReset() {
        setInstantSearchUiState({ query: '', category: currentCategory })
      },
      onSubmit({ state }) {
        setInstantSearchUiState({ query: state.query })
      },
      onStateChange({ prevState, state }) {
        if (prevState.query !== state.query) {
          setInstantSearchUiState({
            query: state.query
          })
        }
      },
      renderer: { createElement, Fragment, render: () => {} },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root

          panelRootRef.current?.unmount()
          panelRootRef.current = createRoot(root)
        }

        panelRootRef.current.render(children)
      },
      plugins
    })

    return () => autocompleteInstance.destroy()
  }, [plugins])

  return <div className={className} ref={autocompleteContainer} />
}
