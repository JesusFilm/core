import { render, screen } from '@testing-library/react'
import { InstantSearch } from 'react-instantsearch'

import { ApolloClientProvider } from '@/components/providers/apollo'
import { SeeAllVideos } from '@/components/watch/home/SeeAllVideos'
import { VideoGrid } from '@/components/watch/home/VideoGrid'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => (key === 'ctaSeeAllVideos' ? 'See All Videos' : key)
}))

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

describe('/watch route integration', () => {
  it('mounts providers and renders CTA + search UI', () => {
    const client = createMockSearchClient()
    render(
      <ApolloClientProvider>
        <InstantSearch searchClient={client} indexName="test_index">
          <SeeAllVideos />
          <VideoGrid />
        </InstantSearch>
      </ApolloClientProvider>
    )

    expect(screen.getByRole('link', { name: /see all videos/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search videos/i)).toBeInTheDocument()
  })
})
