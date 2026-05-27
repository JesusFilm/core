import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'
import { type Mock, type MockedFunction } from 'vitest'

import { VideoFromLocal } from '.'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

vi.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as MockedFunction<
  typeof useSearchBox
>
const mockUseInstantSearch = useInstantSearch as MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as MockedFunction<
  typeof useInfiniteHits
>

describe('VideoFromLocal', () => {
  const items = [
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

  const searchBox = {
    query: '',
    refine: vi.fn()
  } as unknown as SearchBoxRenderState

  const infiniteHits = {
    items: [
      ...items,
      {
        ...items[0],
        titles: ['title2']
      },
      {
        ...items[0],
        titles: ['title3']
      }
    ],
    showMore: vi.fn(),
    isLastPage: false
  } as unknown as InfiniteHitsRenderState

  const instantSearch = {
    status: 'idle',
    results: {
      __isArtificial: false,
      nbHits: items.length
    }
  } as unknown as InstantSearchApi

  beforeEach(() => {
    ;(useMediaQuery as Mock).mockImplementation(() => true)

    mockUseSearchBox.mockReturnValue(searchBox)
    mockUseInfiniteHits.mockReturnValue(infiniteHits)
    mockUseInstantSearch.mockReturnValue(instantSearch)
  })

  it('should render the placeholder text when there is no search query', () => {
    render(<VideoFromLocal onSelect={vi.fn()} />)
    expect(screen.getByText('Featured Videos')).toBeInTheDocument()
    expect(screen.getByText('Jesus Film Library')).toBeInTheDocument()
  })

  it('should render a video list item', async () => {
    const onSelect = vi.fn()
    render(<VideoFromLocal onSelect={onSelect} />)
    await waitFor(() => expect(screen.getByText('title1')).toBeInTheDocument())
    expect(screen.getByText('title2')).toBeInTheDocument()
    expect(screen.getByText('title3')).toBeInTheDocument()
  })

  it('should call show more on Load More button click', async () => {
    const showMore = vi.fn()
    mockUseInfiniteHits.mockReturnValue({
      items,
      showMore,
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    render(<VideoFromLocal onSelect={vi.fn()} />)
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    )
    expect(showMore).toHaveBeenCalled()
  })

  it('should show No More Videos button if last page', async () => {
    mockUseInfiniteHits.mockReturnValue({
      items: [],
      showMore: vi.fn(),
      isLastPage: true
    } as unknown as InfiniteHitsRenderState)

    render(<VideoFromLocal onSelect={vi.fn()} />)
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'No More Videos' })
      ).toBeInTheDocument()
    )
  })

  it('should render No More Videos if video length is 0', async () => {
    mockUseInfiniteHits.mockReturnValue({
      items: [],
      showMore: vi.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    const onSelect = vi.fn()
    render(<VideoFromLocal onSelect={onSelect} />)
    await waitFor(() =>
      expect(screen.getByText('No Results Found')).toBeInTheDocument()
    )
    expect(
      screen.getByRole('button', { name: 'No More Videos' })
    ).toBeDisabled()
  })
})
