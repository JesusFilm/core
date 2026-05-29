import { fireEvent, render, screen } from '@testing-library/react'
import { useRefinementList } from 'react-instantsearch'
import type { MockedFunction } from 'vitest'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { type CoreVideo } from '../../../libs/algolia/transformAlgoliaVideos'
import { useLanguages } from '../../../libs/useLanguages'
import { useLatestVideos } from '../../../libs/useLatestVideos'

import { AlgoliaVideoGrid } from './AlgoliaVideoGrid'

vi.mock('react-instantsearch', () => ({
  useRefinementList: vi.fn()
}))
vi.mock('@core/journeys/ui/algolia/useAlgoliaVideos')
vi.mock('../../../libs/useLanguages')
vi.mock('../../../libs/useLatestVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as MockedFunction<
  typeof useAlgoliaVideos
>
const mockedUseLatestVideos = useLatestVideos as MockedFunction<
  typeof useLatestVideos
>
const mockedUseRefinementList = useRefinementList as MockedFunction<
  typeof useRefinementList
>
const mockedUseLanguages = useLanguages as MockedFunction<typeof useLanguages>

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

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseRefinementList.mockReturnValue({ items: [] } as any)
    mockedUseLanguages.mockReturnValue({ languages: [], isLoading: false })
    mockedUseLatestVideos.mockReturnValue({
      videos: [],
      loading: false
    })
  })

  it('should render a video within the grid', async () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: transformedVideos,
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<AlgoliaVideoGrid />)

    expect(
      screen.getByRole('heading', { level: 3, name: 'title1' })
    ).toBeInTheDocument()
  })

  it('should request most videos', async () => {
    const showMore = vi.fn()
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: transformedVideos,
      showMore,
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    expect(showMore).toHaveBeenCalled()
  })

  it('should not show button when there are no more videos', async () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: transformedVideos,
      showMore: vi.fn(),
      isLastPage: true,
      sendEvent: vi.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(
      screen.queryByRole('button', { name: 'No More Videos' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Load More' })
    ).not.toBeInTheDocument()
  })

  it('should show loading button if loading and there are more videos', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: true,
      noResults: false,
      items: transformedVideos,
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(
      screen.getByRole('button', { name: 'Loading...' })
    ).toBeInTheDocument()
  })

  it('should not show button when loading but no more videos', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: true,
      noResults: false,
      items: transformedVideos,
      showMore: vi.fn(),
      isLastPage: true,
      sendEvent: vi.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(
      screen.queryByRole('button', { name: 'Loading...' })
    ).not.toBeInTheDocument()
  })

  it('should show no results if no items returned', () => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      items: [],
      showMore: vi.fn(),
      isLastPage: true,
      sendEvent: vi.fn()
    })

    render(<AlgoliaVideoGrid showLoadMore />)

    expect(
      screen.getByText('No catch here—try the other side of the boat.')
    ).toBeInTheDocument()
  })

  it('uses refined language when requesting latest videos', () => {
    mockedUseRefinementList.mockReturnValue({
      items: [
        {
          label: 'English',
          value: 'English',
          isRefined: true,
          count: 10
        }
      ] as any
    } as any)
    mockedUseLanguages.mockReturnValue({
      languages: [
        {
          id: '529',
          slug: 'english',
          displayName: 'English',
          englishName: { id: '529', primary: true, value: 'English' },
          nativeName: { id: '529', primary: true, value: 'English' }
        }
      ],
      isLoading: false
    })
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: true,
      items: [],
      showMore: vi.fn(),
      isLastPage: true,
      sendEvent: vi.fn()
    })

    render(<AlgoliaVideoGrid />)

    expect(mockedUseLatestVideos).toHaveBeenCalledWith(
      expect.objectContaining({ languageId: '529', skip: false })
    )
  })
})
