import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ImageOptions } from './ImageOptions'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageOptions', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('opens the image library', async () => {
    const { getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ImageOptions />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByTestId('ImageBlockEditor')).toBeInTheDocument()
    )
  })
})
