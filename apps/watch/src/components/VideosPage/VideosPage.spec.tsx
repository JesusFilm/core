import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import type { HitsRenderState } from 'instantsearch.js/es/connectors/hits/connectHits'
import type { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import type { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import {
  useHits,
  useMenu,
  useSearchBox
} from 'react-instantsearch'

import type { CoreVideo } from '../../libs/algolia/useAlgoliaVideos'
import { useAlgoliaVideos } from '../../libs/algolia/useAlgoliaVideos'

import { VideosPage } from './VideosPage'

jest.mock('react-instantsearch')

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

jest.mock('react-instantsearch')
jest.mock('../../libs/algolia/useAlgoliaVideos')

const mockUseHits = useHits as jest.MockedFunction<typeof useHits>
const mockUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>
const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseMenu = useMenu as jest.MockedFunction<
  typeof useMenu
>

describe('VideosPage', () => {
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

  beforeEach(() => {
    mockUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      hits: transformedVideos,
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })

    mockUseHits.mockReturnValue({
      hits: transformedVideos,
      sendEvent: jest.fn()
    } as unknown as HitsRenderState)

    mockUseSearchBox.mockReturnValue({
      refine: jest.fn
    } as unknown as SearchBoxRenderState)

    mockUseMenu.mockReturnValue({
      items: [],
      refine: jest.fn()
    } as unknown as RefinementListRenderState)

    mockUseClearRefinements.mockReturnValue({
      refine: jest.fn()
    } as unknown as ClearRefinementsRenderState)
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
