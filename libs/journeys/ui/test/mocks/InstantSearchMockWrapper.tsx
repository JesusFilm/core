import React from 'react'
import { InstantSearch } from 'react-instantsearch-core'
import { createAlgoliaSearchClient } from './createAlgoliaSearchClient'

import type { InstantSearchProps } from 'react-instantsearch-core'

const searchClient = createAlgoliaSearchClient({})

type InstantSearchMockWrapperProps = {
  children: React.ReactNode
} & Partial<InstantSearchProps>

export function InstantSearchMockWrapper({
  children,
  ...props
}: InstantSearchMockWrapperProps) {
  return (
    <InstantSearch searchClient={searchClient} indexName="indexName" {...props}>
      {children}
    </InstantSearch>
  )
}

export function createInstantSearchMockWrapper(
  props?: Partial<InstantSearchProps>
) {
  const client = createAlgoliaSearchClient({})

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <InstantSearch searchClient={client} indexName="indexName" {...props}>
      {children}
    </InstantSearch>
  )

  return wrapper
}
