"use client"

import { algoliasearch } from 'algoliasearch'
import type { ReactNode } from 'react'
import { InstantSearch } from 'react-instantsearch'
import { useMemo } from 'react'

export type InstantSearchProvidersProps = { children: ReactNode }

export function InstantSearchProviders({ children }: InstantSearchProvidersProps) {
  const appId = process.env['NEXT_PUBLIC_ALGOLIA_APP_ID'] ?? ''
  const apiKey =
    process.env['NEXT_PUBLIC_ALGOLIA_API_KEY'] ?? process.env['ALGOLIA_SERVER_API_KEY'] ?? ''
  const indexName = process.env['NEXT_PUBLIC_ALGOLIA_INDEX'] ?? ''

  // Memoize the search client to prevent recreation on every render
  const searchClient = useMemo(() => {
    console.log('🔍 InstantSearchProviders: Creating search client')
    const client = algoliasearch(appId, apiKey)

    // Wrap the client to short‑circuit empty queries.
    // When the query is '', return an empty result set so the grid clears
    // instead of showing "all results" and re-triggering searches.
    return {
      ...client,
      async search(
        requests: Array<{ params?: { query?: string; hitsPerPage?: number; page?: number } }>
      ) {
        try {
          const allEmpty = requests.every(
            (r) => !r.params || !r.params.query || r.params.query.trim() === ''
          )

          if (allEmpty) {
            // Provide a stable, valid empty response to avoid re-search loops
            return {
              results: requests.map(() => ({
                hits: [],
                nbHits: 0,
                page: 0,
                nbPages: 1,
                hitsPerPage: 20,
                processingTimeMS: 0,
                exhaustiveNbHits: true,
                query: '',
                params: ''
              }))
            }
          }

          return client.search(requests as any)
        } catch (err) {
          // Fallback to the real request on any unexpected condition
          return client.search(requests as any)
        }
      }
    }
  }, [appId, apiKey])

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      future={{
        preserveSharedStateOnUnmount: true
      }}
    >
      {children}
    </InstantSearch>
  )
}
