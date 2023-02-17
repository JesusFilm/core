import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { createCloudflareUploadByUrlMock } from '../ImageLibrary/CustomImage/CustomUrl/data'
import { ImageBlockEditor } from './ImageBlockEditor'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

const onChange = jest.fn()
const onDelete = jest.fn()

describe('ImageBlockEditor', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('opens the image library', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ImageBlockEditor
            selectedBlock={image}
            onChange={onChange}
            onDelete={onDelete}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    expect(getByTestId('ImageLibrary')).toBeInTheDocument()
  })

  describe('No existing ImageBlock', () => {
    it('shows placeholders on null', async () => {
      const { getByTestId, getByRole } = render(
        <MockedProvider>
          <ImageBlockEditor
            selectedBlock={null}
            onChange={onChange}
            onDelete={onDelete}
          />
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Select Image' }))
      expect(getByTestId('ImageLibrary')).toBeInTheDocument()
      fireEvent.click(getByRole('tab', { name: 'Custom' }))
      fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })
  describe('Existing ImageBlock', () => {
    it('shows placeholders', async () => {
      const { getByTestId, getByRole } = render(
        <MockedProvider>
          <ImageBlockEditor
            selectedBlock={image}
            onChange={onChange}
            onDelete={onDelete}
          />
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Select Image' }))
      expect(getByTestId('ImageLibrary')).toBeInTheDocument()
      fireEvent.click(getByRole('tab', { name: 'Custom' }))
      fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })
  it('triggers onChange', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider mocks={[createCloudflareUploadByUrlMock]}>
        <ImageBlockEditor
          selectedBlock={image}
          onChange={onChange}
          onDelete={onDelete}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    expect(getByTestId('ImageLibrary')).toBeInTheDocument()
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
    const { getByRole, getByTestId } = render(
      <MockedProvider mocks={[createCloudflareUploadByUrlMock]}>
        <ImageBlockEditor
          selectedBlock={image}
          onChange={onChange}
          onDelete={onDelete}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    expect(getByTestId('ImageLibrary')).toBeInTheDocument()
    fireEvent.click(getByRole('tab', { name: 'Custom' }))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = await getByRole('textbox')
    await fireEvent.paste(textBox, {
      clipboardData: { getData: () => 'https://example.com/image.jpg' }
    })
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
