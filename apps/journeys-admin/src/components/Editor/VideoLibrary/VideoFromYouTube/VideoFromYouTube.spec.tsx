import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { mswServer } from '../../../../../test/mswServer'

import {
  getPlaylistItems,
  getPlaylistItemsEmpty,
  getPlaylistItemsWithOffsetAndUrl,
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
    mswServer.use(getPlaylistItems)
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

  it('should call api to get more playlist', async () => {
    mswServer.use(getPlaylistItemsWithOffsetAndUrl)
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

  it('should render No More Videos if playlist length is 0', async () => {
    mswServer.use(getPlaylistItemsEmpty)

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
    mswServer.use(getPlaylistItemsWithOffsetAndUrl)
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

  it('should render video item if filters change', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByRole, getByText } = render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    const textbox = getByRole('textbox', { name: 'Search' })
    fireEvent.change(textbox, {
      target: { value: 'https://www.youtube.com/watch?v=ak06MSETeo4' }
    })
    await waitFor(() => {
      expect(getByText('Blessing and Curse')).toBeInTheDocument()
    })
  })
})
