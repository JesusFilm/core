import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { createCloudflareUploadByUrlMock } from '../ImageBlockEditor/CustomImage/CustomUrl/data'
import { ImageSource } from './ImageSource'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const onChange = jest.fn()
const onDelete = jest.fn()

describe('ImageSource', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  describe('No existing ImageBlock', () => {
    it('shows placeholders on null', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <FlagsProvider flags={{ unsplashGallery: true }}>
            <ImageSource
              selectedBlock={null}
              onChange={onChange}
              onDelete={onDelete}
            />
          </FlagsProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Select Image' }))
      fireEvent.click(getByRole('tab', { name: 'Custom' }))
      fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })
  describe('Existing ImageBlock', () => {
    it('shows placeholders', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <FlagsProvider flags={{ unsplashGallery: true }}>
            <ImageSource
              selectedBlock={null}
              onChange={onChange}
              onDelete={onDelete}
            />
          </FlagsProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Select Image' }))
      fireEvent.click(getByRole('tab', { name: 'Custom' }))
      fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })
  it('triggers onChange', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[createCloudflareUploadByUrlMock]}>
        <FlagsProvider flags={{ unsplashGallery: true }}>
          <ImageSource
            selectedBlock={null}
            onChange={onChange}
            onDelete={onDelete}
          />
        </FlagsProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = await getByRole('textbox')
    fireEvent.change(textBox, {
      target: { value: 'https://example.com/image.jpg' }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
  it('triggers onChange onPaste', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[createCloudflareUploadByUrlMock]}>
        <FlagsProvider flags={{ unsplashGallery: true }}>
          <ImageSource
            selectedBlock={null}
            onChange={onChange}
            onDelete={onDelete}
          />
        </FlagsProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = await getByRole('textbox')
    await fireEvent.paste(textBox, {
      clipboardData: { getData: () => 'https://example.com/image.jpg' }
    })
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
