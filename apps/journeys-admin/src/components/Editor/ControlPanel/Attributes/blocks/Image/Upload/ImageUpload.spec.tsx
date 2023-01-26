import { render } from '@testing-library/react'
import { ImageUpload } from './ImageUpload'

describe('ImageUpload', () => {
  it('should display image upload text', () => {
    const { getByText, getByRole } = render(<ImageUpload />)
    expect(getByText('Drop an image here or')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Choose a file' })).toBeInTheDocument()
  })

  // it('should drop image', async () => {
  //   const { getByTestId } = render(<ImageUpload />)
  //   window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url')
  //   const input = getByTestId('drop zone')
  //   const file = new File(['file'], 'file.png', {
  //     type: 'image/png'
  //   })
  //   Object.defineProperty(input, 'files', {
  //     value: [file]
  //   })
  //   fireEvent.drop(input)
  // })
})
