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
import { usePagination, useSearchBox } from 'react-instantsearch'
import '@algolia/autocomplete-theme-classic'

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  searchClient: SearchClient
  className?: string
}

interface SetInstantSearchUiStateOptions {
  query: string
}

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

  const plugins = useMemo(() => {
    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: 'instantsearch',
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setInstantSearchUiState({ query: item.label })
          }
        }
      }
    })

    const querySuggestions = createQuerySuggestionsPlugin({
      searchClient,
      indexName: 'video-variants-stg_query_suggestions',
      getSearchParams() {
        return recentSearches.data!.getAlgoliaSearchParams({
          hitsPerPage: 6
        })
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: 'querySuggestionsPlugin',
          onSelect({ item }) {
            setInstantSearchUiState({ query: item.query })
          },
          async getItems(params) {
            if (params.state.query === '') {
              return []
            }

            return await source.getItems(params)
          }
        }
      }
    })
    return [recentSearches, querySuggestions]
  }, [])

  useEffect(() => {
    setQuery(instantSearchUiState.query)
    setPage(0)
  }, [instantSearchUiState])

  useEffect(() => {
    if (autocompleteContainer.current == null) {
      return
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      container: autocompleteContainer.current,
      initialState: { query },
      onReset() {
        setInstantSearchUiState({ query: '' })
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
        if (panelRootRef.current == null || rootRef.current !== root) {
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
