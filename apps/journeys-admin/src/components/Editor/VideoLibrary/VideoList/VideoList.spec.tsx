import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEOS } from './VideoList'
import { videos } from './VideoListData'
import { VideoList } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const getVideosMock = {
  request: {
    query: GET_VIDEOS,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: null
      }
    }
  },
  result: {
    data: {
      videos
    }
  }
}

const getVideosEmptyWithOffsetMock = {
  request: {
    query: GET_VIDEOS,
    variables: {
      offset: 3,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: null
      }
    }
  },
  result: {
    data: {
      videos: []
    }
  }
}

const getVideosEmptyMock = {
  request: {
    query: GET_VIDEOS,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: null
      }
    }
  },
  result: {
    data: {
      videos: []
    }
  }
}

const getVideosWithTitleMock = {
  request: {
    query: GET_VIDEOS,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: 'abc'
      }
    }
  },
  result: {
    data: {
      videos
    }
  }
}

describe('Video List', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render a video list item', async () => {
    const onSelect = jest.fn()
    const { getByText } = render(
      <MockedProvider
        mocks={[getVideosMock]}
      >
        <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText("Andreas' Story")).toBeInTheDocument()
    )
    expect(getByText('Brand_Video')).toBeInTheDocument()
    expect(getByText('The Demoniac')).toBeInTheDocument()
  })

  it('should call api to get more videos', async () => {
    const result = jest.fn(() => ({
      data: {
        videos: []
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getVideosMock,
          {...getVideosEmptyWithOffsetMock, result }
        ]}
      >
        <VideoList onSelect={jest.fn()} currentLanguageIds={['529']} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('button', { name: 'Load More'})).toBeEnabled())
    fireEvent.click(getByRole('button', { name: 'Load More'}))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('button', { name: 'No More Videos'})).toBeDisabled()
  })

  it('should render No More Videos if video length is 0', async () => {
    const onSelect = jest.fn()
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getVideosEmptyMock]}>
        <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No Results Found')).toBeInTheDocument()
    )
    expect(getByRole('button', { name: 'No More Videos'})).toBeDisabled()
  })

  it('should re-enable Load More if filters change', async() => {
    const { getByRole, rerender } = render(
      <MockedProvider
        mocks={[
          getVideosMock,
          getVideosEmptyWithOffsetMock,
          getVideosWithTitleMock
        ]}
      >
        <VideoList onSelect={jest.fn()} currentLanguageIds={['529']} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('button', { name: 'Load More'})).toBeEnabled())
    fireEvent.click(getByRole('button', { name: 'Load More'}))
    await waitFor(() => expect(getByRole('button', { name: 'No More Videos'})).toBeDisabled())
    rerender(
      <MockedProvider
        mocks={[
          getVideosMock,
          getVideosEmptyWithOffsetMock,
          getVideosWithTitleMock
        ]}
      >
        <VideoList title="abc" onSelect={jest.fn()} currentLanguageIds={['529']} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('button', { name: 'Load More'})).toBeEnabled())
  })
})
