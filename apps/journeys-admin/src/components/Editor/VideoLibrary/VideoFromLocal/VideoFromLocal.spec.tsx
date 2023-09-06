import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { VideoLabel } from '../../../../../__generated__/globalTypes'

import { videos } from './data'
import { GET_VIDEOS } from './VideoFromLocal'

import { VideoFromLocal } from '.'

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
        title: null,
        labels: [
          VideoLabel.episode,
          VideoLabel.featureFilm,
          VideoLabel.segment,
          VideoLabel.shortFilm
        ]
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
        title: null,
        labels: [
          VideoLabel.episode,
          VideoLabel.featureFilm,
          VideoLabel.segment,
          VideoLabel.shortFilm
        ]
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
        title: null,
        labels: [
          VideoLabel.episode,
          VideoLabel.featureFilm,
          VideoLabel.segment,
          VideoLabel.shortFilm
        ]
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
        title: 'abc',
        labels: [
          VideoLabel.episode,
          VideoLabel.featureFilm,
          VideoLabel.segment,
          VideoLabel.shortFilm
        ]
      }
    }
  },
  result: {
    data: {
      videos
    }
  }
}

describe('VideoFromLocal', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render a video list item', async () => {
    const onSelect = jest.fn()
    const { getByText } = render(
      <MockedProvider mocks={[getVideosMock]}>
        <VideoFromLocal onSelect={onSelect} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByText("Andreas' Story")).toBeInTheDocument())
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
        mocks={[getVideosMock, { ...getVideosEmptyWithOffsetMock, result }]}
      >
        <VideoFromLocal onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Load More' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Load More' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })

  it('should render No More Videos if video length is 0', async () => {
    const onSelect = jest.fn()
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[getVideosEmptyMock]}>
        <VideoFromLocal onSelect={onSelect} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No Results Found')).toBeInTheDocument()
    )
    expect(getByRole('button', { name: 'No More Videos' })).toBeDisabled()
  })

  it('should re-enable Load More if filters change', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getVideosMock,
          getVideosEmptyWithOffsetMock,
          getVideosWithTitleMock
        ]}
      >
        <VideoFromLocal onSelect={jest.fn()} />
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
      target: { value: 'abc' }
    })
    await waitFor(() =>
      expect(getByRole('button', { name: 'Load More' })).toBeEnabled()
    )
  })
})
