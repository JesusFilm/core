import { MockedProvider } from '@apollo/client/testing'
import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { videos } from './data'

import { VideoList } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('VideoList', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render a video list items', () => {
    const { getByText } = render(
      <MockedProvider>
        <VideoList
          videos={videos}
          loading={false}
          fetchMore={jest.fn()}
          hasMore
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    expect(getByText('Brand_Video')).toBeInTheDocument()
    expect(getByText('The Demoniac')).toBeInTheDocument()
  })

  // Mock nested VideoDetails to render a Select button to complete flow
  jest.mock('../VideoListItem/VideoListItem', () => ({
    __esModule: true,
    VideoListItem: ({
      onSelect,
      id
    }: {
      onSelect: (v: unknown) => void
      id: string
    }) => <button onClick={() => onSelect({})}>Select</button>
  }))

  it('should call onSelect when Video is clicked', async () => {
    const onSelect = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <VideoList
          videos={videos}
          loading={false}
          fetchMore={jest.fn()}
          hasMore
          onSelect={onSelect}
        />
      </MockedProvider>
    )
    fireEvent.click(
      getByRole('button', {
        name: "Andreas' Story After living a life full of fighter planes and porsches, Andreas realizes something is missing. 03:06"
      })
    )
    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'Select' }))
    )
    expect(onSelect).toHaveBeenCalled()
  })

  it('should call fetchMore when Load More is clicked', () => {
    const fetchMore = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <VideoList
          videos={videos}
          loading={false}
          fetchMore={fetchMore}
          hasMore
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Load More' }))
    expect(fetchMore).toHaveBeenCalled()
  })

  it('should render No More Videos if hasMore is false', () => {
    const { getByRole } = render(
      <MockedProvider>
        <VideoList
          videos={videos}
          loading={false}
          fetchMore={jest.fn()}
          hasMore={false}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })

  it('should render No More Videos and No Results if videos is empty', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <VideoList
          videos={[]}
          loading={false}
          fetchMore={jest.fn()}
          hasMore
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    expect(getByText('No Results Found')).toBeInTheDocument()
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })
})
