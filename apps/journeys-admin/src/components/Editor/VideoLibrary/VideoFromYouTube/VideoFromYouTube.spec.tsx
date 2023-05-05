import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { SWRConfig } from 'swr'
import { MockedProvider } from '@apollo/client/testing'
import { mswServer } from '../../../../../test/mswServer'
import {
  getVideos,
  getVideosEmpty,
  getVideosWithOffsetAndUrl
} from './VideoFromYouTube.handlers'
import { VideoFromYouTube } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('VideoFromYouTube', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render a video list item', async () => {
    mswServer.use(getVideos)
    const { getByText } = render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('What is the Bible?')).toBeInTheDocument()
    )
  })

  it('should call api to get more videos', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByRole } = render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Load More' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Load More' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
    )
  })

  it('should render No More Videos if video length is 0', async () => {
    mswServer.use(getVideosEmpty)

    const { getByText, getByRole } = render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No Results Found')).toBeInTheDocument()
    )
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })

  it('should re-enable Load More if filters change', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByRole, getByText } = render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Load More' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Load More' }))
    await waitFor(() =>
      expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
    )
    const textbox = getByRole('textbox', { name: 'Search' })
    fireEvent.change(textbox, {
      target: { value: 'https://www.youtube.com/watch?v=jQaeIJOA6J0' }
    })
    await waitFor(() =>
      expect(getByText('Blessing and Curse')).toBeInTheDocument()
    )
  })
})
