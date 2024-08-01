import algoliasearch from 'algoliasearch'
import { UiState } from 'instantsearch.js'
import { ReactElement, ReactNode } from 'react'
import { InstantSearch } from 'react-instantsearch'

interface InstantSearchWrapperProps {
  query?: string
  indexName: string
  children: ReactNode
}

export function InstantSearchTestWrapper({
  query = '',
  indexName,
  children,
  ...props
}: InstantSearchWrapperProps): ReactElement {
  const searchClient = algoliasearch(
   'algolia',
   'algolia'
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
      {...props}
    >
      {children}
    </InstantSearch>
  )
}
