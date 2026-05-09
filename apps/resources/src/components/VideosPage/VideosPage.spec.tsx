import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import type { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import type { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import type { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  InstantSearchApi,
  useHits,
  useInstantSearch,
  useMenu,
  useSearchBox
} from 'react-instantsearch'
import type { MockedFunction } from 'vitest'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { type CoreVideo } from '../../libs/algolia/transformAlgoliaVideos'

import { VideosPage } from './VideosPage'

vi.mock('react-instantsearch')
vi.mock('@core/journeys/ui/algolia/useAlgoliaVideos')

const mockUseHits = useHits as MockedFunction<typeof useHits>
const mockUseAlgoliaVideos = useAlgoliaVideos as MockedFunction<
  typeof useAlgoliaVideos
>
const mockUseSearchBox = useSearchBox as MockedFunction<typeof useSearchBox>
const mockUseMenu = useMenu as MockedFunction<typeof useMenu>
const mockUseInstantSearch = useInstantSearch as MockedFunction<
  typeof useInstantSearch
>

describe('VideosPage', async () => {
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
    mockUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: transformedVideos,
      showMore: vi.fn(),
      isLastPage: false,
      sendEvent: vi.fn()
    })

    mockUseHits.mockReturnValue({
      hits: transformedVideos,
      sendEvent: vi.fn()
    } as unknown as HitsRenderState)

    mockUseSearchBox.mockReturnValue({
      refine: vi.fn
    } as unknown as SearchBoxRenderState)

    mockUseMenu.mockReturnValue({
      items: [],
      refine: vi.fn()
    } as unknown as RefinementListRenderState)

    mockUseInstantSearch.mockReturnValue({
      refresh: vi.fn()
    } as unknown as InstantSearchApi)
  })

  it('should render the languages filter', async () => {
    render(
      <MockedProvider>
        <VideosPage />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByText('Languages')[0]).toBeInTheDocument()
    )
  })

  it('should render the subtitles filter', async () => {
    render(
      <MockedProvider>
        <VideosPage />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('Subtitles')).toBeInTheDocument()
    )
  })

  it('should render the search bar', async () => {
    render(
      <MockedProvider>
        <VideosPage />
      </MockedProvider>
    )
    await waitFor(() => expect(screen.getByText('Title')).toBeInTheDocument())
  })

  it('should render the video title', async () => {
    render(
      <MockedProvider>
        <VideosPage />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 3, name: 'title1' })
      ).toBeInTheDocument()
    )
  })
})
