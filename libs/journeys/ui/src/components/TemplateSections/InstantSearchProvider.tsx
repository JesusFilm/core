import algoliasearch from 'algoliasearch'
import { UiState } from 'instantsearch.js'
import { ReactElement, ReactNode } from 'react'
import { InstantSearch } from 'react-instantsearch'

interface InstantSearchWrapperProps {
  query?: string
  indexName: string
  children: ReactNode
}

export function InstantSearchWrapper({
  query = '',
  indexName,
  children
}: InstantSearchWrapperProps): ReactElement {
  const searchClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
  )

  const initState: UiState = {
    [indexName]: {
      query: query
    }
  }

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      initialUiState={initState}
    >
      {children}
    </InstantSearch>
  )
}
