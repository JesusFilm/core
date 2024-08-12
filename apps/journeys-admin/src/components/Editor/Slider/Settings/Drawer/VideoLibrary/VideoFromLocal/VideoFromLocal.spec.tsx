import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ConfigureRenderState } from 'instantsearch.js/es/connectors/configure/connectConfigure'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  InstantSearchApi,
  useConfigure,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'

import { VideoFromLocal } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as jest.MockedFunction<
  typeof useInfiniteHits
>
const mockUseConfigure = useConfigure as jest.MockedFunction<
  typeof useConfigure
>

describe('VideoFromLocal', () => {
  const algoliaVideos = [
    {
      videoId: 'videoId',
      titles: ['title1'],
      description: ['description'],
      duration: 10994,
      languageId: '529',
      subtitles: [],
      slug: 'video-slug/english',
      label: 'featureFilm',
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_GOJ-0-0.mobileCinematicHigh.jpg',
      imageAlt: 'Life of Jesus (Gospel of John)',
      childrenCount: 49,
      objectID: '2_529-GOJ-0-0'
    }
  ]

  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)

    mockUseSearchBox.mockReturnValue({
      refine: jest.fn()
    } as unknown as SearchBoxRenderState)

    mockUseInfiniteHits.mockReturnValue({
      hits: [
        ...algoliaVideos,
        {
          ...algoliaVideos[0],
          titles: ['title2']
        },
        {
          ...algoliaVideos[0],
          titles: ['title3']
        }
      ],
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    mockUseInstantSearch.mockReturnValue({
      status: 'idle'
    } as unknown as InstantSearchApi)

    mockUseConfigure.mockReturnValue({
      ruleContexts: ['home_page'],
      filters: 'languageId:529',
      hitsPerPage: 5
    } as unknown as ConfigureRenderState)
  })

  it('should render a video list item', async () => {
    const onSelect = jest.fn()
    render(<VideoFromLocal onSelect={onSelect} />)
    await waitFor(() => expect(screen.getByText('title1')).toBeInTheDocument())
    expect(screen.getByText('title2')).toBeInTheDocument()
    expect(screen.getByText('title3')).toBeInTheDocument()
  })

  it('should call api to get more videos', async () => {
    const showMore = jest.fn()

    mockUseConfigure.mockReturnValue({
      ruleContexts: ['home_page'],
      filters: 'languageId:529',
      hitsPerPage: 2
    } as unknown as ConfigureRenderState)

    mockUseInfiniteHits
      .mockReturnValue({
        hits: [
          ...algoliaVideos,
          {
            ...algoliaVideos[0],
            titles: ['title2']
          },
          {
            ...algoliaVideos[0],
            titles: ['title3']
          }
        ],
        showMore,
        isLastPage: false
      } as unknown as InfiniteHitsRenderState)
      .mockReturnValue({
        hits: [],
        showMore: jest.fn(),
        isLastPage: true
      } as unknown as InfiniteHitsRenderState)

    render(<VideoFromLocal onSelect={jest.fn()} />)
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    )
    expect(showMore).toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'No More Videos' })
    ).toBeDisabled()
  })

  it('should render No More Videos if video length is 0', async () => {
    mockUseInfiniteHits.mockReturnValue({
      hits: [],
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    const onSelect = jest.fn()
    render(<VideoFromLocal onSelect={onSelect} />)
    await waitFor(() =>
      expect(screen.getByText('No Results Found')).toBeInTheDocument()
    )
    expect(
      screen.getByRole('button', { name: 'No More Videos' })
    ).toBeDisabled()
  })

  it('should re-enable Load More if filters change', async () => {
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Load More' })).toBeEnabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'No More Videos' })
      ).toBeDisabled()
    )
    const textbox = screen.getByRole('textbox', { name: 'Search' })
    fireEvent.change(textbox, {
      target: { value: 'abc' }
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Load More' })).toBeEnabled()
    )
  })
})
