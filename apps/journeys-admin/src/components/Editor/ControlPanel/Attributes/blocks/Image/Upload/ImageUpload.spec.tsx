import { fireEvent, render, waitFor } from '@testing-library/react'
import { ImageUpload } from './ImageUpload'

describe('ImageUpload', () => {
  it('should display image upload text', () => {
    const { getByText, getByRole } = render(<ImageUpload />)
    expect(getByText('Drop an image here or')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Choose a file' })).toBeInTheDocument()
  })

  it('should open file input window on button click', async () => {
    global.open = jest.fn()
    const { getByRole } = render(<ImageUpload />)
    const button = getByRole('button', { name: 'Choose a file' })
    fireEvent.click(button)
    // TODO: Find out why this doesn't work
    await waitFor(() => {
      expect(window.open).toHaveBeenCalled()
    })
  })

  it('should drop image', async () => {
    const { getByTestId } = render(<ImageUpload />)
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    const input = getByTestId('drop zone')
    const file = new File(['file'], 'testFile.png', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    await waitFor(() => {
      expect(input).toHaveTextContent('testFile.png')
    })
  })
})
