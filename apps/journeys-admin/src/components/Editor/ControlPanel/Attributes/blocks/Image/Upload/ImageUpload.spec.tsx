import { render, fireEvent } from '@testing-library/react'
import { ImageUpload } from './ImageUpload'

describe('ImageUpload', () => {
  it('should display image upload text', () => {
    const { getByText, getByRole } = render(<ImageUpload />)
    expect(getByText('Drop Image Here')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Choose a file' })).toBeInTheDocument()
  })

  it('should drop image', async () => {
    const { getByLabelText, findByText } = render(<ImageUpload />)
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
    const input = getByLabelText('drop input')
    const file = new File(['file'], 'file.jpg', {
      type: 'image/png'
    })
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.drop(input)
    expect(await findByText('file.jpg')).toBeInTheDocument()
  })
})
