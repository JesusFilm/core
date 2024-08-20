import { fireEvent, render, screen } from '@testing-library/react'

import type { CoreVideo } from '../../../libs/algolia/useAlgoliaVideos'
import { useAlgoliaVideos } from '../../../libs/algolia/useAlgoliaVideos'

import { AlgoliaVideoGrid } from './AlgoliaVideoGrid'

jest.mock('react-instantsearch')
jest.mock('../../../libs/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('AlgoliaVideoGrid', () => {
  const transformedVideos = [
    {
      __typename: 'Video',
      childrenCount: 49,
      id: 'videoId',
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
      imageAlt: [
        {
          value: 'Life of Jesus (Gospel of John)'
        }
      ],
      label: 'featureFilm',
      slug: 'video-slug/english',
      snippet: [],
      title: [
        {
          value: 'title1'
        }
      ],
      variant: {
        duration: 10994,
        hls: null,
        id: '2_529-GOJ-0-0',
        slug: 'video-slug/english'
      }
    }
  ] as unknown as CoreVideo[]

  it('should render a video within the grid', async () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      hits: transformedVideos,
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })

    render(<AlgoliaVideoGrid />)

    expect(
      screen.getByRole('heading', { level: 3, name: 'title1' })
    ).toBeInTheDocument()
  })

  it('should request most videos', async () => {
    const showMore = jest.fn()
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      hits: transformedVideos,
      showMore,
      isLastPage: false,
      sendEvent: jest.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    expect(showMore).toHaveBeenCalled()
  })

  it('should show no more videos button', async () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      hits: transformedVideos,
      showMore: jest.fn(),
      isLastPage: true,
      sendEvent: jest.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(
      screen.getByRole('button', { name: 'No More Videos' })
    ).toBeInTheDocument()
  })

  it('should show loading button if loading or stalled', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: true,
      noResults: false,
      hits: transformedVideos,
      showMore: jest.fn(),
      isLastPage: true,
      sendEvent: jest.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(
      screen.getByRole('button', { name: 'Loading...' })
    ).toBeInTheDocument()
  })

  it('should show no results if no hits returned', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      hits: [],
      showMore: jest.fn(),
      isLastPage: true,
      sendEvent: jest.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(screen.getByText('Sorry, no results')).toBeInTheDocument()
  })
})
