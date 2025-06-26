'use client'

import { algoliasearch } from 'algoliasearch'
import { ReactElement } from 'react'
import { InstantSearch } from 'react-instantsearch'

import { AlgoliaVideoList } from '../../../../components/VideoList/AlgoliaVideoList/AlgoliaVideoList'

// Initialize Algolia client
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

export default function AlgoliaVideosPage(): ReactElement {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      stalledSearchDelay={500}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <AlgoliaVideoList />
    </InstantSearch>
  )
}
