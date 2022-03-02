import { render, fireEvent } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { VideoDetails } from './VideoDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video Details', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  it('should render the content of VideoListItem', () => {
    const { getByText, getByTestId } = render(
      <VideoDetails videoId="nua1-uuid" open={true} />
    )
    expect(getByText('Video Details')).toBeInTheDocument()
    expect(getByText('Fact or fiction')).toBeInTheDocument()
    expect(getByTestId('VideoDetailsLanguageButton')).toHaveTextContent(
      'Other Languages'
    )
    expect(getByTestId('VideoDetailsSelectButton')).toHaveTextContent(
      'Select Video'
    )
  })

  it('should close VideoDetails on close Icon click', () => {
    const handleOpen = jest.fn()
    const { getAllByRole, getByTestId } = render(
      <VideoDetails videoId="nua1-uuid" open={true} handleOpen={handleOpen} />
    )
    expect(getAllByRole('button')[0]).toContainElement(getByTestId('CloseIcon'))
    fireEvent.click(getAllByRole('button')[0])
    expect(handleOpen).toHaveBeenCalled()
  })

  // add test for clicking on other languages button

  it('should call onSelect on click', () => {
    const onSelect = jest.fn()
    const { getByTestId } = render(
      <VideoDetails videoId="nua1-uuid" open={true} onSelect={onSelect} />
    )
    expect(getByTestId('VideoDetailsSelectButton')).toContainElement(
      getByTestId('CheckIcon')
    )
    fireEvent.click(getByTestId('VideoDetailsSelectButton'))
    expect(onSelect).toHaveBeenCalled()
  })
})
