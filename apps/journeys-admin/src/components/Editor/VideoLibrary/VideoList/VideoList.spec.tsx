import { render, fireEvent } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { MockedProvider } from '@apollo/client/testing'
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
      <VideoList
        videos={videos}
        loading={false}
        fetchMore={jest.fn()}
        hasMore
        onSelect={jest.fn()}
      />
    )
    expect(getByText('Brand_Video')).toBeInTheDocument()
    expect(getByText('The Demoniac')).toBeInTheDocument()
  })

  it('should call onSelect when Video is clicked', () => {
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
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalled()
  })

  it('should call fetchMore when Load More is clicked', () => {
    const fetchMore = jest.fn()
    const { getByRole } = render(
      <VideoList
        videos={videos}
        loading={false}
        fetchMore={fetchMore}
        hasMore
        onSelect={jest.fn()}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Load More' }))
    expect(fetchMore).toHaveBeenCalled()
  })

  it('should render No More Videos if hasMore is false', () => {
    const { getByRole } = render(
      <VideoList
        videos={videos}
        loading={false}
        fetchMore={jest.fn()}
        hasMore={false}
        onSelect={jest.fn()}
      />
    )
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })

  it('should render No More Videos and No Results if videos is empty', () => {
    const { getByText, getByRole } = render(
      <VideoList
        videos={[]}
        loading={false}
        fetchMore={jest.fn()}
        hasMore
        onSelect={jest.fn()}
      />
    )
    expect(getByText('No Results Found')).toBeInTheDocument()
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })

  it('should render No More Videos and No Results if videos is empty', () => {
    const { getByText, getByRole } = render(
      <VideoList
        videos={[]}
        loading={false}
        fetchMore={jest.fn()}
        hasMore
        onSelect={jest.fn()}
      />
    )
    expect(getByText('No Results Found')).toBeInTheDocument()
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })
})
