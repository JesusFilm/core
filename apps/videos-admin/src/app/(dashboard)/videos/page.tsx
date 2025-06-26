'use client'

import { algoliasearch } from 'algoliasearch'
import { ReactElement } from 'react'
import { InstantSearch } from 'react-instantsearch'

import { AlgoliaVideoList } from '../../../components/VideoList/AlgoliaVideoList'

import { VideoList } from './_VideoList'

// Feature flag - set to true to use Algolia implementation
const USE_ALGOLIA = process.env.NEXT_PUBLIC_USE_ALGOLIA_ADMIN === 'true'

// Initialize Algolia client only if needed
const searchClient = USE_ALGOLIA
  ? algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID ?? '',
      process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
    )
  : null

export default function VideosPage(): ReactElement {
  // Use Algolia implementation if flag is enabled
  if (USE_ALGOLIA && searchClient) {
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

  // Default to GraphQL implementation
  return <VideoList />
}
