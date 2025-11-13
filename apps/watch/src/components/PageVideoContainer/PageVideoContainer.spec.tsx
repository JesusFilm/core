import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { useVideoChildren } from '../../libs/useVideoChildren'
import { VideoLabel } from '../../../__generated__/globalTypes'
import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { PageVideoContainer } from '.'

jest.mock('react-instantsearch')
jest.mock('@core/journeys/ui/algolia/useAlgoliaVideos')
jest.mock('../../libs/useVideoChildren', () => ({
  useVideoChildren: jest.fn()
}))
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))
jest.mock('./AudioLanguageSelect', () => ({
  AudioLanguageSelect: () => (
    <div data-testid="AudioLanguageSelect">Audio Selector</div>
  )
}))

const mockedUseAlgoliaVideos = useAlgoliaVideos as jest.MockedFunction<
  typeof useAlgoliaVideos
>
const mockedUseVideoChildren = useVideoChildren as jest.MockedFunction<
  typeof useVideoChildren
>

describe('PageVideoContainer', () => {
  beforeEach(() => {
    mockedUseAlgoliaVideos.mockReturnValue({
      loading: false,
      noResults: false,
      items: [],
      showMore: jest.fn(),
      isLastPage: false,
      sendEvent: jest.fn()
    })
    mockedUseVideoChildren.mockReturnValue({
      loading: false,
      children: []
    })
    jest.clearAllMocks()
  })

  it('should show language switcher', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <PageVideoContainer />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('AudioLanguageSelect')).toBeInTheDocument()
  })

  it('should render CollectionHero', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <PageVideoContainer />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByTestId('CollectionHero')).toBeInTheDocument()
  })

  it('should render snippet', async () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <PageVideoContainer />
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
            <PageVideoContainer />
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
    const mockChild = {
      id: 'child-video',
      label: VideoLabel.series,
      title: [{ __typename: 'VideoTitle', value: 'Reflections of Hope' }],
      images: [],
      imageAlt: [],
      variant: {
        __typename: 'VideoVariant',
        slug: 'child-video/en',
        language: { __typename: 'Language', id: '529', bcp47: 'en' }
      }
    } as unknown as VideoChildFields
    mockedUseVideoChildren.mockReturnValue({
      loading: false,
      children: [mockChild]
    })
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[5] }}>
            <PageVideoContainer />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(
        getByRole('heading', { name: 'Reflections of Hope' })
      ).toBeInTheDocument()
    })
  })

  it('should render blurred content shell', () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <VideoProvider value={{ content: videos[0] }}>
            <PageVideoContainer />
          </VideoProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('ContentPageBlurFilter')).toBeInTheDocument()
  })
})
