import { render, fireEvent, waitFor } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { MockedProvider } from '@apollo/client/testing'
import { GET_VIDEO, VideoDetails } from './VideoDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video Details', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  it('should render details of a video', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEO,
              variables: {
                videoId: '2_Acts7302-0-0'
              }
            },
            result: {
              data: {
                video: {
                  id: '2_Acts7302-0-0',
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
                      value:
                        'Jesus promises the Holy Spirit; then ascends into the clouds.'
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
        ]}
      >
        <VideoDetails videoId="2_Acts7302-0-0" open={true} />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByText('Jesus Taken Up Into Heaven')).toBeInTheDocument()
    )
    expect(
      getByText('Jesus promises the Holy Spirit; then ascends into the clouds.')
    ).toBeInTheDocument()
    const sourceTag = getByTestId('VideoDetails-2_Acts7302-0-0').querySelector(
      '.vjs-tech source'
    )
    expect(sourceTag?.getAttribute('src')).toEqual('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    const imageTag = getByTestId('VideoDetails-2_Acts7302-0-0').querySelector(
      '.vjs-poster'
    )
    expect(imageTag).toHaveStyle(
      "background-image: url('https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg')"
    )
  })

  it('should close VideoDetails on close Icon click', () => {
    const handleOpen = jest.fn()
    const { getAllByRole, getByTestId } = render(
      <MockedProvider>
        <VideoDetails
          videoId="2_Acts7302-0-0"
          open={true}
          handleOpen={handleOpen}
        />
      </MockedProvider>
    )
    expect(getAllByRole('button')[0]).toContainElement(getByTestId('CloseIcon'))
    fireEvent.click(getAllByRole('button')[0])
    expect(handleOpen).toHaveBeenCalled()
  })

  it('should open the languages drawer on language button click', () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <VideoDetails videoId="2_Acts7302-0-0" open={true} />
      </MockedProvider>
    )
    expect(getByTestId('VideoDetailsLanguageButton')).toContainElement(
      getByTestId('ArrowDropDownIcon')
    )
    fireEvent.click(getByTestId('VideoDetailsLanguageButton'))
    expect(getByText('Language')).toBeInTheDocument()
  })

  it('should call onSelect on click', async () => {
    const onSelect = jest.fn()
    const { getByTestId } = render(
      <MockedProvider>
        <VideoDetails
          videoId="2_Acts7302-0-0"
          open={true}
          onSelect={onSelect}
        />
      </MockedProvider>
    )
    expect(getByTestId('VideoDetailsSelectButton')).toContainElement(
      getByTestId('CheckIcon')
    )
    fireEvent.click(getByTestId('VideoDetailsSelectButton'))
    expect(onSelect).toHaveBeenCalled()
  })
})
