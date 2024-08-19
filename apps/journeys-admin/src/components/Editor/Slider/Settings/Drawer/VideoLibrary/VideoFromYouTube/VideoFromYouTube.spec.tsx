import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { useSearchBox } from 'react-instantsearch'
import { SWRConfig } from 'swr'

import { mswServer } from '../../../../../../../../test/mswServer'

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

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>

describe('VideoFromYouTube', () => {
  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
    mockUseSearchBox.mockReturnValue({
      refine: jest.fn()
    } as unknown as SearchBoxRenderState)
  })

  it('should render a video list item', async () => {
    mswServer.use(getPlaylistItems)
    render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('What is the Bible?')).toBeInTheDocument()
    )
  })

  it('should call api to get more playlist', async () => {
    mswServer.use(getPlaylistItemsWithOffsetAndUrl)
    render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Load More' })).toBeEnabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'No More Videos' })
      ).toBeDisabled()
    )
  })

  it('should render No More Videos if playlist length is 0', async () => {
    mswServer.use(getPlaylistItemsEmpty)

    render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByText('No Results Found')).toBeInTheDocument()
    )
    expect(
      screen.getByRole('button', { name: 'No More Videos' })
    ).toBeDisabled()
  })

  it('should re-enable Load More if filters change', async () => {
    mswServer.use(getPlaylistItemsWithOffsetAndUrl)
    render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Load More' })).toBeEnabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Load More' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'No More Videos' })
      ).toBeDisabled()
    )
    const searchBox = screen.getByRole('searchbox', { name: 'Search' })
    fireEvent.change(searchBox, {
      target: { value: 'https://www.youtube.com/watch?v=jQaeIJOA6J0' }
    })
    await waitFor(() =>
      expect(screen.getByText('Blessing and Curse')).toBeInTheDocument()
    )
  })

  it('should render video item if filters change', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    render(
      <MockedProvider>
        <SWRConfig value={{ provider: () => new Map() }}>
          <VideoFromYouTube onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    const searchBox = screen.getByRole('searchbox', { name: 'Search' })
    fireEvent.change(searchBox, {
      target: { value: 'https://www.youtube.com/watch?v=ak06MSETeo4' }
    })
    await waitFor(() => {
      expect(screen.getByText('Blessing and Curse')).toBeInTheDocument()
    })
  })
})
