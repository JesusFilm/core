import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { AudioLanguageFileUpload } from './AudioLanguageFileUpload'

const messages = {
  'Drop a video here': 'Drop a video here',
  'Upload file': 'Upload file',
  'Change file': 'Change file',
  'Uploading...': 'Uploading...',
  'Processing...': 'Processing...',
  'Upload Failed!': 'Upload Failed!',
  'Something went wrong, try again': 'Something went wrong, try again',
  'Invalid file type.': 'Invalid file type.'
}

describe('AudioLanguageFileUpload', () => {
  it('should render upload area', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AudioLanguageFileUpload onFileSelect={jest.fn()} />
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('AudioLanguageFileUpload')).toBeInTheDocument()
    expect(screen.getByText('Drop a video here')).toBeInTheDocument()
    expect(screen.getByText('Upload file')).toBeInTheDocument()
  })

  it('should show selected file name', () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AudioLanguageFileUpload onFileSelect={jest.fn()} selectedFile={file} />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('test.mp4')).toBeInTheDocument()
    expect(screen.getByText('Change file')).toBeInTheDocument()
  })

  describe('upload states', () => {
    it('should show uploading state', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <AudioLanguageFileUpload onFileSelect={jest.fn()} uploading />
        </NextIntlClientProvider>
      )

      expect(screen.getByText('Uploading...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should show processing state', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <AudioLanguageFileUpload onFileSelect={jest.fn()} processing />
        </NextIntlClientProvider>
      )

      expect(screen.getByText('Processing...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should show error state', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <AudioLanguageFileUpload
            onFileSelect={jest.fn()}
            error="Something went wrong"
          />
        </NextIntlClientProvider>
      )

      expect(screen.getByText('Upload Failed!')).toBeInTheDocument()
      expect(
        screen.getByText('Something went wrong, try again')
      ).toBeInTheDocument()
    })
  })

  describe('file handling', () => {
    it('should handle successful file selection', async () => {
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
      const onFileSelect = jest.fn()

      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <AudioLanguageFileUpload onFileSelect={onFileSelect} />
        </NextIntlClientProvider>
      )
      const input = screen.getByTestId('DropZone')
      Object.defineProperty(input, 'files', {
        value: [file]
      })
      fireEvent.drop(input)
      await waitFor(() => expect(onFileSelect).toHaveBeenCalledWith(file))
    })

    it('should handle file rejection', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const onFileSelect = jest.fn()

      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <AudioLanguageFileUpload onFileSelect={onFileSelect} />
        </NextIntlClientProvider>
      )

      const input = screen.getByTestId('DropZone')
      Object.defineProperty(input, 'files', {
        value: [file]
      })
      fireEvent.drop(input, {})
      await waitFor(() =>
        expect(screen.getByText('Invalid file type.')).toBeInTheDocument()
      )
      expect(onFileSelect).not.toHaveBeenCalled()
    })
  })
})
