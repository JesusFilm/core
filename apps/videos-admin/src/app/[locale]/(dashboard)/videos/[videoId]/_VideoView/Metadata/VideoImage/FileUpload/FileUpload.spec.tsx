import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { FileUpload } from './FileUpload'

describe('FileUpload', () => {
  it('should upload a file', async () => {
    const mockOnDrop = jest.fn()
    const onUploadComplete = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <FileUpload
          onDrop={mockOnDrop}
          onUploadComplete={onUploadComplete}
          accept={{
            'image/*': []
          }}
          loading={false}
        />
      </NextIntlClientProvider>
    )

    const input = screen.getByTestId('DropZone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => expect(mockOnDrop).toHaveBeenCalled())
    await waitFor(() => expect(onUploadComplete).toHaveBeenCalled())
  })

  it('should still call on upload complete if no files are dropped', async () => {
    const mockOnDrop = jest.fn()
    const onUploadComplete = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <FileUpload
          onDrop={mockOnDrop}
          onUploadComplete={onUploadComplete}
          accept={{
            'image/*': []
          }}
          loading={false}
        />
      </NextIntlClientProvider>
    )

    const input = screen.getByTestId('DropZone')
    fireEvent.drop(input)
    await waitFor(() => expect(mockOnDrop).not.toHaveBeenCalled())
    await waitFor(() => expect(onUploadComplete).toHaveBeenCalled())
  })

  it('should show loading state', async () => {
    const mockOnDrop = jest.fn()
    const onUploadComplete = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <FileUpload
          onDrop={mockOnDrop}
          onUploadComplete={onUploadComplete}
          accept={{
            'image/*': []
          }}
          loading
        />
      </NextIntlClientProvider>
    )

    await waitFor(() =>
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    )
  })
})
