import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CodeActionButton } from './CodeActionButton'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('CodeActionButton', () => {
  it('should render the download buttons', () => {
    render(
      <CodeActionButton shortLink="url" handleGenerateQrCode={jest.fn()} />
    )

    expect(
      screen.getByRole('button', { name: 'Download PNG' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('DownloadDropdown')).toBeInTheDocument()
  })

  it('should copy short link', async () => {
    render(
      <SnackbarProvider>
        <CodeActionButton shortLink="url" handleGenerateQrCode={jest.fn()} />
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByTestId('DownloadDropdown'))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy Short Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('url')
    await waitFor(() =>
      expect(screen.getByText('Link copied')).toBeInTheDocument()
    )
  })

  it('should handle qr code generation', () => {
    const generateQrCode = jest.fn()
    render(
      <CodeActionButton
        shortLink={undefined}
        handleGenerateQrCode={generateQrCode}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Generate Code' }))
    expect(generateQrCode).toHaveBeenCalled()
  })

  it('should be disabled while loading', () => {
    render(
      <CodeActionButton
        shortLink="url"
        loading
        handleGenerateQrCode={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeDisabled()
  })

  // test for download png

  // test for download svg
})
