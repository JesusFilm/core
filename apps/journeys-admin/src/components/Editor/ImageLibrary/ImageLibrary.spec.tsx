import { fireEvent, render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { ImageLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageLibrary', () => {
  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should switch tabs', () => {
      const { getByText } = render(
        <FlagsProvider>
          <ImageLibrary open onClose={jest.fn()} />
        </FlagsProvider>
      )
      expect(getByText('Custom')).toBeInTheDocument()
    })

    it('should render the Image Library on the right', () => {
      const { getByText, getByTestId } = render(
        <FlagsProvider flags={{ unsplashGallery: true }}>
          <ImageLibrary open />
        </FlagsProvider>
      )
      expect(getByText('Unsplash')).toBeInTheDocument()
      expect(getByTestId('ImageLibrary').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })

    it('should close ImageLibrary on close Icon click', () => {
      const onClose = jest.fn()
      const { getAllByRole, getByTestId } = render(
        <FlagsProvider>
          <ImageLibrary open onClose={onClose} />
        </FlagsProvider>
      )
      expect(getAllByRole('button')[0]).toContainElement(
        getByTestId('CloseIcon')
      )
      fireEvent.click(getAllByRole('button')[0])
      expect(onClose).toHaveBeenCalled()
    })

    it('does not render unsplash as an option', () => {
      const { queryByText, getByText } = render(
        <FlagsProvider>
          <ImageLibrary open />
        </FlagsProvider>
      )
      expect(queryByText('Unplash')).not.toBeInTheDocument()
      expect(getByText('Custom')).toBeInTheDocument()
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the Image Library from the bottom', () => {
      const { getByText, getByTestId } = render(
        <FlagsProvider flags={{ unsplashGallery: true }}>
          <ImageLibrary open />
        </FlagsProvider>
      )
      expect(getByText('Unsplash')).toBeInTheDocument()
      expect(getByTestId('ImageLibrary').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorBottom'
      )
    })
  })

  // TODO:
  // Unsplash Test
  // Custom Test
})