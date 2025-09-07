"use client"

import { algoliasearch } from 'algoliasearch'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'
import { InstantSearch } from 'react-instantsearch'

export type InstantSearchProvidersProps = { children: ReactNode }

// Minimal context to share Algolia client + index across the app
type AlgoliaContextValue = { searchClient: any; indexName: string }
const AlgoliaClientContext = createContext<AlgoliaContextValue | null>(null)

export function useAlgoliaClient(): AlgoliaContextValue {
  const ctx = useContext(AlgoliaClientContext)
  if (!ctx) throw new Error('useAlgoliaClient must be used inside InstantSearchProviders')
  return ctx
}

export function useOptionalAlgoliaClient(): AlgoliaContextValue | null {
  return useContext(AlgoliaClientContext)
}

export function InstantSearchProviders({ children }: InstantSearchProvidersProps) {
  const appId = process.env['NEXT_PUBLIC_ALGOLIA_APP_ID'] ?? ''
  const apiKey =
    process.env['NEXT_PUBLIC_ALGOLIA_API_KEY'] ?? process.env['ALGOLIA_SERVER_API_KEY'] ?? ''
  const indexName = process.env['NEXT_PUBLIC_ALGOLIA_INDEX'] ?? ''

  // Memoize the search client to prevent recreation on every render
  const searchClient = useMemo(() => {
    if (process.env['NODE_ENV'] !== 'production') {
      console.log('🔍 InstantSearchProviders: Creating search client')
    }
    const client = algoliasearch(appId, apiKey)

    // Wrap the client to short‑circuit empty queries.
    // When the query is '', return an empty result set so the grid clears
    // instead of showing "all results" and re-triggering searches.
    return {
      ...client,
      async search(requests: any[]) {
        try {
          // Support both legacy (v4-style with `params`) and v5 flat request shapes
          const getParams = (r: any) => r?.params ?? r
          const getQuery = (r: any) => {
            const p = getParams(r)
            return p?.query as string | undefined
          }
          const isEmptyQuery = (q?: string) => !q || q.trim() === ''
          const allEmpty = requests.every((r) => isEmptyQuery(getQuery(r)))

          // Identify facet-only requests so we can still fetch facet values
          const facetRequestIndexes: number[] = []
          requests.forEach((r, i) => {
            const p: any = getParams(r) ?? {}
            const hasFacetIndicators =
              typeof p.facets !== 'undefined' || typeof p.maxValuesPerFacet !== 'undefined' || r.type === 'facet'
            const isHitsSuppressed =
              p.hitsPerPage === 0 || (Array.isArray(p.attributesToRetrieve) && p.attributesToRetrieve.length === 0)
            if (hasFacetIndicators || isHitsSuppressed) facetRequestIndexes.push(i)
          })

          if (allEmpty) {
            // If empty query, fetch real results for facet requests only, return empty hits for the rest
            if (facetRequestIndexes.length > 0) {
              const facetRequests = facetRequestIndexes.map((i) => requests[i])
              const facetResponse = await client.search(facetRequests as any)
              const facetResults = facetResponse.results

              let facetCursor = 0
              const mergedResults = requests.map((_, i) => {
                if (facetRequestIndexes.includes(i)) {
                  // Use the corresponding facet result, preserving order
                  return facetResults[facetCursor++]
                }
                // Provide a stable empty hits response
                return {
                  hits: [],
                  nbHits: 0,
                  page: 0,
                  nbPages: 1,
                  hitsPerPage: 20,
                  processingTimeMS: 0,
                  exhaustiveNbHits: true,
                  query: '',
                  params: ''
                }
              })

              return { results: mergedResults }
            }

            // No facet requests present; return empty results for everything
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

          // Non-empty query: run normally
          return client.search(requests as any)
        } catch (err) {
          // Fallback to the real request on any unexpected condition
          return client.search(requests as any)
        }
      }
    }
  }, [appId, apiKey])

  return (
    <AlgoliaClientContext.Provider value={{ searchClient, indexName }}>
      <InstantSearch
        searchClient={searchClient}
        indexName={indexName}
        future={{
          preserveSharedStateOnUnmount: true
        }}
      >
        {children}
      </InstantSearch>
    </AlgoliaClientContext.Provider>
  )
}
