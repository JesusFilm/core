import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { VideoContainerPage } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => {
    return {
      query: {}
    }
  }
}))

jest.mock('react-instantsearch')
jest.mock('@core/journeys/ui/algolia/useAlgoliaVideos')

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>

describe('VideoContainerPage', () => {
  beforeEach(() => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: [],
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })
    jest.clearAllMocks()
  })

  it('should show language switcher', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('LanguageRoundedIcon')).toBeInTheDocument()
  })

  it('should render ContainerHero', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText(videos[0].title[0].value)).toBeInTheDocument()
  })

  it('should render snippet', async () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText(videos[0].snippet[0].value)).toBeInTheDocument()
  })

  it('should render share button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContainerPage />
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

  it('should get videos', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[getVideoChildrenMock]}>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[5] }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Reflections of Hope' })
      ).toBeInTheDocument()
    )
  })

  it('should not render header spacer', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoContainerPage />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.queryByTestId('HeaderSpacer')).not.toBeInTheDocument()
  })
})
