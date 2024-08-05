import algoliasearch from 'algoliasearch'
import type { UiState } from 'instantsearch.js'
import type { ReactElement, ReactNode } from 'react'
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
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
  )

  const initState: UiState = {
    [indexName]: {
      query
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
