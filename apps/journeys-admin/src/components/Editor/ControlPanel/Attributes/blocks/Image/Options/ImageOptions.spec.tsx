import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ImageOptions } from './ImageOptions'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageOptions', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))
  it('opens the image library', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ImageOptions />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByTestId('ImageBlockEditor')).toBeInTheDocument()
  })
})
