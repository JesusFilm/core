import { MockedProvider } from '@apollo/client/testing'
import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { render, screen, waitFor } from '@testing-library/react'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useRefinementList, useSearchBox } from 'react-instantsearch'
import {
  AlgoliaVideos,
  useAlgoliaVideos
} from '../../libs/algolia/useAlgoliaVideos'
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

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

const mockedUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

const mockedUseRefinementList = useRefinementList as jest.MockedFunction<
  typeof useRefinementList
>

describe('VideosPage', () => {
  const algoliaVideos = [
    {
      videoId: 'videoId',
      title: [
        {
          value: 'title1'
        }
      ],
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
  ] as unknown as AlgoliaVideos[]

  beforeEach(() => {
    mockedUseAlgoliaVideos.mockReturnValue({
      hits: algoliaVideos,
      showMore: jest.fn(),
      isLastPage: false
    })

    mockedUseSearchBox.mockReturnValue({
      refine: jest.fn
    } as unknown as SearchBoxRenderState)

    mockedUseRefinementList.mockReturnValue({
      items: [],
      refine: jest.fn()
    } as unknown as RefinementListRenderState)
  })

  it('should render videos page', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LANGUAGES,
              variables: {
                languageId: '529'
              }
            },
            result: {
              data: {
                languages: [
                  {
                    id: '496',
                    name: [
                      {
                        value: 'French',
                        primary: true
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]}
      >
        <VideosPage />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getAllByText('Languages')[0]).toBeInTheDocument()
    )
    expect(screen.getByText('Subtitles')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'title1' })
    ).toBeInTheDocument()
  })
})
