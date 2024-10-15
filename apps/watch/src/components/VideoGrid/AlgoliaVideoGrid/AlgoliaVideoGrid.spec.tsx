import { fireEvent, render, screen } from '@testing-library/react'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { type CoreVideo } from '../../../libs/algolia/transformAlgoliaVideos'

import { AlgoliaVideoGrid } from './AlgoliaVideoGrid'

jest.mock('react-instantsearch')
jest.mock('@core/journeys/ui/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('AlgoliaVideoGrid', () => {
  const transformedVideos = [
    {
      __typename: 'Video',
      childrenCount: 49,
      id: 'videoId',
      images: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh:
            'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_GOJ-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
        }
      ],
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
      items: transformedVideos,
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
      items: transformedVideos,
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
      items: transformedVideos,
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
      items: transformedVideos,
      showMore: jest.fn(),
      isLastPage: true,
      sendEvent: jest.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(
      screen.getByRole('button', { name: 'Loading...' })
    ).toBeInTheDocument()
  })

  it('should show no results if no items returned', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      items: [],
      showMore: jest.fn(),
      isLastPage: true,
      sendEvent: jest.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(screen.getByText('Sorry, no results')).toBeInTheDocument()
  })
})
