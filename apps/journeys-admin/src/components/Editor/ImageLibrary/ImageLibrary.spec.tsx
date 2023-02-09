import { fireEvent, render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { MockedProvider } from '@apollo/client/testing'
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
          <MockedProvider>
            <ImageLibrary open onClose={jest.fn()} />
          </MockedProvider>
        </FlagsProvider>
      )
      expect(getByText('Custom')).toBeInTheDocument()
    })

    it('should render the Image Library on the right', () => {
      const { getAllByText, getByTestId } = render(
        <FlagsProvider flags={{ unsplashGallery: true }}>
          <MockedProvider>
            <ImageLibrary open />
          </MockedProvider>
        </FlagsProvider>
      )
      expect(getAllByText('Unsplash')[0]).toBeInTheDocument()
      expect(getByTestId('ImageLibrary').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })

    it('should close ImageLibrary on close Icon click', () => {
      const onClose = jest.fn()
      const { getAllByRole, getByTestId } = render(
        <FlagsProvider>
          <MockedProvider>
            <ImageLibrary open onClose={onClose} />
          </MockedProvider>
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
          <MockedProvider>
            <ImageLibrary open />
          </MockedProvider>
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
      const { getAllByText, getByTestId } = render(
        <FlagsProvider flags={{ unsplashGallery: true }}>
          <MockedProvider>
            <ImageLibrary open />
          </MockedProvider>
        </FlagsProvider>
      )
      expect(getAllByText('Unsplash')[0]).toBeInTheDocument()
      expect(getByTestId('ImageLibrary').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorBottom'
      )
    })
  })
})
