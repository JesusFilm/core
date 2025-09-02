"use client"

import { algoliasearch } from 'algoliasearch'
import type { ReactNode } from 'react'
import { InstantSearch } from 'react-instantsearch'

export type InstantSearchProvidersProps = { children: ReactNode }

export function InstantSearchProviders({ children }: InstantSearchProvidersProps) {
  const appId = process.env['NEXT_PUBLIC_ALGOLIA_APP_ID'] ?? ''
  const apiKey =
    process.env['NEXT_PUBLIC_ALGOLIA_API_KEY'] ?? process.env['ALGOLIA_SERVER_API_KEY'] ?? ''
  const indexName = process.env['NEXT_PUBLIC_ALGOLIA_INDEX'] ?? ''

  const searchClient = algoliasearch(appId, apiKey)

  return <InstantSearch searchClient={searchClient} indexName={indexName}>{children}</InstantSearch>
}
