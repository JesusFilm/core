import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEO, VideoDetails } from './VideoDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('VideoDetails', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  const mocks = [
    {
      request: {
        query: GET_VIDEO,
        variables: {
          id: '2_Acts7302-0-0'
        }
      },
      result: {
        data: {
          video: {
            id: '2_Acts7302-0-0',
            primaryLanguageId: '529',
            image:
              'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
            title: [
              {
                primary: true,
                value: 'Jesus Taken Up Into Heaven'
              }
            ],
            description: [
              {
                primary: true,
                value: 'Jesus promises the Holy Spirit.'
              }
            ],
            variant: {
              duration: 144,
              hls: 'https://arc.gt/opsgn'
            }
          }
        }
      }
    }
  ]
  it('should render details of a video', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <VideoDetails
          id="2_Acts7302-0-0"
          open={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    expect(
      getByRole('heading', { name: 'Jesus Taken Up Into Heaven' })
    ).toBeInTheDocument()
    expect(getByText('Jesus promises the Holy Spirit.')).toBeInTheDocument()
    const videoPlayer = getByRole('region', {
      name: 'Video Player'
    })
    const sourceTag = videoPlayer.querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    const imageTag = videoPlayer.querySelector('.vjs-poster')
    expect(imageTag).toHaveStyle(
      "background-image: url('https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg')"
    )
  })

  it('should close VideoDetails on close Icon click', () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <VideoDetails
          id="2_Acts7302-0-0"
          open={true}
          onClose={onClose}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('should open the languages drawer on language button click', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <VideoDetails
          id="2_Acts7302-0-0"
          open={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Other Languages' }))
    expect(getByText('Language')).toBeInTheDocument()
  })

  it('should call onSelect and onClose on select click', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <VideoDetails
          id="2_Acts7302-0-0"
          open={true}
          onClose={onClose}
          onSelect={onSelect}
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith('2_Acts7302-0-0', '529')
    expect(onClose).toHaveBeenCalledWith()
  })
})
