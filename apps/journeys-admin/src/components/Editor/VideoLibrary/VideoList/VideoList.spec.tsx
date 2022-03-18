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

describe('Video List', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('should render a video list item', async () => {
    const onSelect = jest.fn()
    const { getByTestId, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEOS,
              variables: {
                where: {
                  availableVariantLanguageIds: ['529'],
                  title: null
                }
              }
            },
            result: {
              data: {
                videos: videos
              }
            }
          }
        ]}
      >
        <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
      </MockedProvider>
    )
    expect(getByTestId('VideoListLoadMore')).toHaveTextContent('No More Videos')
    await waitFor(() =>
      expect(getAllByRole('button')[0]).toHaveTextContent("Andreas' Story")
    )
    expect(getAllByRole('button')[0]).toHaveClass('MuiListItemButton-root')
    expect(getAllByRole('button')[1]).toHaveTextContent('Brand_Video')
    expect(getAllByRole('button')[2]).toHaveTextContent('The Demoniac')
  })

  it('should render more video list items on click', async () => {
    const onSelect = jest.fn()
    const { getByTestId, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEOS,
              variables: {
                where: {
                  availableVariantLanguageIds: ['529'],
                  title: null
                }
              }
            },
            result: {
              data: {
                videos: [...videos, ...videos]
              }
            }
          }
        ]}
      >
        <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByRole('button')[0]).toHaveTextContent("Andreas' Story")
    )
    expect(getAllByRole('button')[0]).toHaveClass('MuiListItemButton-root')
    expect(getAllByRole('button')[4]).not.toHaveTextContent('Brand_Video')
    fireEvent.click(getByTestId('VideoListLoadMore'))
    expect(getAllByRole('button')[4]).toHaveTextContent('Brand_Video')
  })

  it('should render No More Videos if video length is 0', async () => {
    const onSelect = jest.fn()
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEOS,
              variables: {
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
        ]}
      >
        <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('No Results Found')).toBeInTheDocument()
    )
  })
})
