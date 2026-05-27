import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CodeActionButton } from './CodeActionButton'

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn()
  }
})

describe('CodeActionButton', () => {
  it('should render the download buttons', () => {
    render(
      <CodeActionButton shortLink="url" handleGenerateQrCode={vi.fn()} />
    )

    expect(
      screen.getByRole('button', { name: 'Download PNG' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('DownloadDropdown')).toBeInTheDocument()
  })

  it('should copy short link', async () => {
    render(
      <SnackbarProvider>
        <CodeActionButton shortLink="url" handleGenerateQrCode={vi.fn()} />
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
    const generateQrCode = vi.fn()
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
        handleGenerateQrCode={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeDisabled()
  })

  it('should download png when canvas is present', () => {
    const canvas = document.createElement('canvas')
    canvas.id = 'qr-code-download'
    document.body.appendChild(canvas)
    const toDataURLMock = vi
      .spyOn(canvas, 'toDataURL')
      .mockReturnValue('data:image/png;base64,test')

    render(
      <CodeActionButton shortLink="url" handleGenerateQrCode={vi.fn()} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Download PNG' }))

    expect(toDataURLMock).toHaveBeenCalledWith('image/png')
    document.body.removeChild(canvas)
  })

  it('should handle error when downloading png', () => {
    const canvas = document.createElement('canvas')
    canvas.id = 'qr-code-download'
    document.body.appendChild(canvas)
    vi.spyOn(canvas, 'toDataURL').mockImplementation(() => {
      throw new Error('Test error')
    })

    render(
      <SnackbarProvider>
        <CodeActionButton shortLink="url" handleGenerateQrCode={vi.fn()} />
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Download PNG' }))

    expect(screen.getByText('Error downloading')).toBeInTheDocument()
    document.body.removeChild(canvas)
  })
})
