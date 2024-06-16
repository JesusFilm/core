import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'

import { useVideoSearch } from './utils/useVideoSearch/useVideoSearch'

import { VideoFromLocal } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('./utils/useVideoSearch/useVideoSearch', () => ({
  __esModule: true,
  useVideoSearch: jest.fn()
}))

const useVideoSearchMock = useVideoSearch as jest.MockedFunction<
  typeof useVideoSearch
>

describe('VideoFromLocal', () => {
  const handleLoadMore = jest.fn()
  const handleSearch = jest.fn()

  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should render a video list item', async () => {
    useVideoSearchMock.mockReturnValueOnce({
      isEnd: true,
      loading: false,
      handleSearch,
      handleLoadMore,
      algoliaVideos: [
        {
          id: '9_0-TheSavior',
          title: 'The Savior',
          description: 'some description',
          image:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/9_0-The_Savior.mobileCinematicHigh.jpg',
          duration: 0,
          source: VideoBlockSource.internal
        }
      ]
    })

    const onSelect = jest.fn()
    const { getByText } = render(<VideoFromLocal onSelect={onSelect} />)
    await waitFor(() => expect(getByText('The Savior')).toBeInTheDocument())
  })

  it('should call handleLoadMore and handleSearch if load more button is clicked', async () => {
    useVideoSearchMock.mockReturnValueOnce({
      isEnd: false,
      loading: false,
      handleSearch,
      handleLoadMore,
      algoliaVideos: [
        {
          id: '9_0-TheSavior',
          title: 'The Savior',
          description: 'some description',
          image:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/9_0-The_Savior.mobileCinematicHigh.jpg',
          duration: 0,
          source: VideoBlockSource.internal
        }
      ]
    })

    const onSelect = jest.fn()
    const { getByRole } = render(<VideoFromLocal onSelect={onSelect} />)
    await waitFor(() =>
      expect(getByRole('button', { name: 'Load More' })).toBeEnabled()
    )

    fireEvent.click(getByRole('button', { name: 'Load More' }))
    expect(handleLoadMore).toHaveBeenCalled()
    expect(handleSearch).toHaveBeenCalled()
  })

  it('should render No More Videos if video length is 0', async () => {
    useVideoSearchMock.mockReturnValueOnce({
      isEnd: true,
      loading: false,
      handleSearch,
      handleLoadMore,
      algoliaVideos: []
    })
    const onSelect = jest.fn()
    const { getByText, getByRole } = render(
      <VideoFromLocal onSelect={onSelect} />
    )
    await waitFor(() =>
      expect(getByText('No Results Found')).toBeInTheDocument()
    )
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })

  it('should render Load More if there are more videos', async () => {
    useVideoSearchMock.mockReturnValueOnce({
      isEnd: false,
      loading: false,
      handleSearch,
      handleLoadMore,
      algoliaVideos: [
        {
          id: '9_0-TheSavior',
          title: 'The Savior',
          description: 'some description',
          image:
            'https://d1wl257kev7hsz.cloudfront.net/cinematics/9_0-The_Savior.mobileCinematicHigh.jpg',
          duration: 0,
          source: VideoBlockSource.internal
        }
      ]
    })
    const onSelect = jest.fn()
    const { getByText, getByRole } = render(
      <VideoFromLocal onSelect={onSelect} />
    )
    await waitFor(() => expect(getByText('Load More')).toBeInTheDocument())
    expect(getByRole('button', { name: 'Load More' })).toBeEnabled()
  })

  it('should call handleSearch if text in searchbox changes', async () => {
    useVideoSearchMock
      .mockReturnValueOnce({
        isEnd: true,
        loading: false,
        handleSearch,
        handleLoadMore,
        algoliaVideos: []
      })
      .mockReturnValueOnce({
        isEnd: false,
        loading: false,
        handleSearch,
        handleLoadMore,
        algoliaVideos: [
          {
            id: '9_0-TheSavior',
            title: 'The Savior',
            description: 'some description',
            image:
              'https://d1wl257kev7hsz.cloudfront.net/cinematics/9_0-The_Savior.mobileCinematicHigh.jpg',
            duration: 0,
            source: VideoBlockSource.internal
          }
        ]
      })
    render(<VideoFromLocal onSelect={jest.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('No Results Found')).toBeInTheDocument()
    })

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'No More Videos' })
      ).toBeDisabled()
    )

    const textbox = screen.getByRole('textbox', { name: 'Search' })
    expect(textbox).toHaveValue('')
    fireEvent.change(textbox, {
      target: { value: 'The Savior' }
    })

    expect(textbox).toHaveValue('The Savior')

    await waitFor(() => {
      expect(
        screen.getByTestId('VideoListItem-9_0-TheSavior')
      ).toBeInTheDocument()
    })
  })
})
