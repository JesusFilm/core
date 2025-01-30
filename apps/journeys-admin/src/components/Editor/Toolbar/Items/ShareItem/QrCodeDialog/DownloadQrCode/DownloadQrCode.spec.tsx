import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { DownloadQrCode } from './DownloadQrCode'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('DownloadQrCode', () => {
  it('should render the download buttons', () => {
    render(<DownloadQrCode to="url" />)

    expect(
      screen.getByRole('button', { name: 'Download PNG' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('DownloadDropdown')).toBeInTheDocument()
  })

  it('should copy short link', async () => {
    render(
      <SnackbarProvider>
        <DownloadQrCode to="url" />
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByTestId('DownloadDropdown'))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy Short Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('url')
    await waitFor(() =>
      expect(screen.getByText('Link copied')).toBeInTheDocument()
    )
  })

  // test for download png

  // test for download svg
})
