import { fireEvent, render, screen } from '@testing-library/react'
import type { MockedFunction } from 'vitest'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { videos } from '../Videos/__generated__/testData'

import { VideoGrid } from './VideoGrid'

vi.mock('react-instantsearch')
vi.mock('@core/journeys/ui/algolia/useAlgoliaVideos')
vi.mock('../../libs/blurhash', () => ({
  useBlurhash: vi.fn(() => ({
    blurhash: null,
    dominantColor: null,
    isLoading: false,
    error: null
  })),
  blurImage: vi.fn(() => 'data:image/webp;base64,test')
}))
vi.mock('../../libs/thumbnail', () => ({
  useThumbnailUrl: vi.fn(() => ({
    thumbnailUrl: null,
    isLoading: false,
    error: null
  }))
}))
vi.mock('../../libs/watchContext', () => ({
  useWatch: vi.fn(() => ({
    state: { audioLanguageId: '529' }
  }))
}))

const mockedUseAlgoliaVideos = useAlgoliaVideos as MockedFunction<
  typeof useAlgoliaVideos
>

describe('VideoGrid', () => {
  it('should render core videos', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<VideoGrid videos={videos} />)

    expect(
      screen.getByRole('heading', { level: 3, name: 'JESUS' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Life of Jesus (Gospel of John)'
      })
    ).toBeInTheDocument()
  })

  it('should render loading more button', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<VideoGrid videos={videos} showLoadMore />)

    expect(
      screen.getByRole('button', { name: 'Load More' })
    ).toBeInTheDocument()
  })

  it('should render load more button loading state', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: true,
      noResults: false,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<VideoGrid videos={[]} showLoadMore loading />)

    expect(
      screen.getByRole('button', { name: 'Loading...' })
    ).toBeInTheDocument()
  })

  it('should render skeleton loading state', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: true,
      noResults: false,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<VideoGrid videos={[]} loading />)

    expect(
      screen.queryAllByTestId('VideoImageSkeleton').length
    ).toBeGreaterThan(0)
  })

  it('should not render loading more button if no results', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<VideoGrid videos={videos} showLoadMore hasNoResults />)

    expect(screen.queryByRole('button', { name: 'Load More' })).toBeNull()
  })

  it('should render no results', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<VideoGrid videos={[]} hasNoResults />)

    expect(screen.getByText('No videos found')).toBeInTheDocument()
    expect(
      screen.getByText('No catch here—try the other side of the boat.')
    ).toBeInTheDocument()
  })

  it('should trigger search reset when try another search is clicked', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    const handleClearSearch = vi.fn()

    render(
      <VideoGrid videos={[]} hasNoResults onClearSearch={handleClearSearch} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Try another search' }))
    expect(handleClearSearch).toHaveBeenCalled()
  })

  it('should render fallback videos when provided', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(
      <VideoGrid videos={[]} hasNoResults fallbackVideos={videos.slice(0, 1)} />
    )

    expect(screen.getByText('Latest videos')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'JESUS' })
    ).toBeInTheDocument()
  })

  it('should render sequence numbers when enabled', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: [],
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<VideoGrid videos={videos.slice(0, 2)} showSequenceNumbers />)

    const sequenceBadges = screen.getAllByTestId('VideoCardSequenceNumber')
    expect(sequenceBadges).toHaveLength(2)
    expect(sequenceBadges[0]).toHaveTextContent('1')
    expect(sequenceBadges[1]).toHaveTextContent('2')
  })
})
