import { render, screen } from '@testing-library/react'

import { useAlgoliaVideos } from '../../libs/algolia/useAlgoliaVideos'
import { videos } from '../Videos/__generated__/testData'

import { VideoGrid } from './VideoGrid'

jest.mock('react-instantsearch')
jest.mock('../../libs/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('VideoGrid', () => {
  it('should render core videos', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      hits: [],
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
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
      hits: [],
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
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
      hits: [],
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
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
      hits: [],
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })

    render(<VideoGrid videos={[]} loading />)

    expect(
      screen.queryAllByTestId('VideoTitleSkeleton').length
    ).toBeGreaterThan(0)
    expect(
      screen.queryAllByTestId('VideoImageSkeleton').length
    ).toBeGreaterThan(0)
    expect(
      screen.queryAllByTestId('VideoVariantDurationSkeleton').length
    ).toBeGreaterThan(0)
  })

  it('should not render loading more button if no results', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      hits: [],
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })

    render(<VideoGrid videos={videos} showLoadMore hasNoResults />)

    expect(screen.queryByRole('button', { name: 'Load More' })).toBeNull()
  })

  it('should render no results', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      hits: [],
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })

    render(<VideoGrid videos={[]} hasNoResults />)

    expect(screen.getByText('Sorry, no results')).toBeInTheDocument()
  })
})
