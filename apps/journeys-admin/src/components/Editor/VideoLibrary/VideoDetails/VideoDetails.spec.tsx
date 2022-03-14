import { render, fireEvent } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { VideoDetails } from './VideoDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video Details', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  it('should render details of a video', () => {
    const { getByText, getByTestId } = render(
      <VideoDetails videoId='2_Acts7302-0-0' open={true} />
    )
    expect(getByText('Jesus Taken Up Into Heaven')).toBeInTheDocument()
    const sourceTag = getByTestId(
      'VideoDetails-2_Acts7302-0-0'
    ).querySelector('.vjs-tech source')
    expect(sourceTag?.getAttribute('src')).toEqual('https://arc.gt/opsgn')
    expect(sourceTag?.getAttribute('type')).toEqual('application/x-mpegURL')
    const imageTag = getByTestId('VideoDetails-2_Acts7302-0-0').querySelector('.vjs-poster')
    expect(imageTag).toHaveStyle("background-image: url('https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg')")

  })

  it('should close VideoDetails on close Icon click', () => {
    const handleOpen = jest.fn()
    const { getAllByRole, getByTestId } = render(
      <VideoDetails videoId="2_Acts7302-0-0" open={true} handleOpen={handleOpen} />
    )
    expect(getAllByRole('button')[0]).toContainElement(getByTestId('CloseIcon'))
    fireEvent.click(getAllByRole('button')[0])
    expect(handleOpen).toHaveBeenCalled()
  })

  // add test for clicking on other languages button

  it('should call onSelect on click', () => {
    const onSelect = jest.fn()
    const { getByTestId } = render(
      <VideoDetails videoId="2_Acts7302-0-0" open={true} onSelect={onSelect} />
    )
    expect(getByTestId('VideoDetailsSelectButton')).toContainElement(
      getByTestId('CheckIcon')
    )
    fireEvent.click(getByTestId('VideoDetailsSelectButton'))
    expect(onSelect).toHaveBeenCalled()
  })
})
