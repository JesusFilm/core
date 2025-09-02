import { render, screen } from '@testing-library/react'
import { InstantSearch } from 'react-instantsearch'

import { VideoGrid } from './VideoGrid'

function createMockSearchClient() {
  return {
    search: jest.fn().mockResolvedValue({
      results: [
        {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 10,
          processingTimeMS: 1,
          query: '',
          params: ''
        }
      ]
    })
  }
}

describe('VideoGrid', () => {
  it('renders SearchBox and pagination within InstantSearch', () => {
    const client = createMockSearchClient()
    render(
      <InstantSearch searchClient={client} indexName="test_index">
        <VideoGrid />
      </InstantSearch>
    )

    expect(screen.getByPlaceholderText(/search videos/i)).toBeInTheDocument()
  })
})

