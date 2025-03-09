import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { File as FileComponent } from './File'

const file = new File(['test'], 'test.txt', { type: 'text/vtt' })

describe('File', () => {
  it('should render without actions', () => {
    render(<FileComponent file={file} type="text" />)

    expect(screen.getByText('test.txt')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'view-file' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'delete-file' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'download-file' })
    ).not.toBeInTheDocument()
  })

  it('should render with actions', () => {
    const onDelete = jest.fn()
    const onDownload = jest.fn()
    render(
      <FileComponent
        file={file}
        type="text"
        actions={{ onDelete, onDownload }}
      />
    )

    expect(screen.getByText('test.txt')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'view-file' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'delete-file' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'download-file' })
    ).toBeInTheDocument()
  })

  describe('text file', () => {
    const textFile = new File(['text file content'], 'test.txt', {
      type: 'text/plain'
    })

    it('should render', () => {
      render(<FileComponent file={textFile} type="text" />)

      expect(screen.getByText('test.txt')).toBeInTheDocument()
      expect(screen.getByTestId('EyeOpenIcon')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'view-file' })
      ).toBeInTheDocument()
    })

    it('should open text preview', async () => {
      render(<FileComponent file={textFile} type="text" />)
      const user = userEvent.setup()

      const button = screen.getByRole('button', { name: 'view-file' })
      await user.click(button)

      expect(screen.getByText('Preview')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.getByText('text file content')).toBeInTheDocument()
      })
    })
  })
})
