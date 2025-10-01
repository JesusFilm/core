import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { type NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { type CoreVideo } from '../../libs/algolia/transformAlgoliaVideos'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { VideoContentPage } from '.'

jest.mock('@core/journeys/ui/algolia/useAlgoliaVideos')
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>
const mockRouter: Partial<NextRouter> = {
  replace: jest.fn(),
  asPath: '/watch/video-slug/english.html',
  locale: 'en'
}
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('VideoContentPage', () => {
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
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter as NextRouter)
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: transformedVideos,
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })
  })

  it('should render VideoHero', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByRole('button', { name: 'Play' })).toHaveLength(1)
  })

  it('should render description', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('tab', { name: 'Description' })).toBeInTheDocument()
  })

  it('should render children', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getVideoChildrenMock]}>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[1] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: videos[1].title[0].value })
      ).toBeInTheDocument()
    )
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Share' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(
      getByRole('dialog', { name: 'Share this video' })
    ).toBeInTheDocument()
  })

  it('should render download button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Download' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Download' }))
    expect(getByRole('dialog', { name: 'Download Video' })).toBeInTheDocument()
  })

  it('should not render download button if no downloads', () => {
    const { queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[5] }}>
            <VideoContentPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(queryByRole('button', { name: 'Download' })).not.toBeInTheDocument()
  })
})
