import { render, fireEvent } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { VideoLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Video Library', () => {
  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render the Video Library on the right', () => {
      const { getByText, getByTestId } = render(<VideoLibrary open={true} />)
      expect(getByText('Video Library')).toBeInTheDocument()
      expect(getByTestId('VideoList').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })

    it('should close VideoLibrary on close Icon click', () => {
      const onClose = jest.fn()
      const { getAllByRole, getByTestId } = render(
        <VideoLibrary open={true} onClose={onClose} />
      )
      expect(getAllByRole('button')[0]).toContainElement(
        getByTestId('CloseIcon')
      )
      fireEvent.click(getAllByRole('button')[0])
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the VideoLibrary from the bottom', () => {
      const { getByText, getByTestId } = render(<VideoLibrary open={true} />)
      expect(getByText('Video Library')).toBeInTheDocument()
      expect(getByTestId('VideoList').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorBottom'
      )
    })
  })
})
