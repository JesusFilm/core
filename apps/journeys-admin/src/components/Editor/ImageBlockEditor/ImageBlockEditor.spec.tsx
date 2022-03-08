import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockEditor } from './ImageBlockEditor'

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
  describe('No existing ImageBlock', () => {
    it('shows placeholders on null', async () => {
      const { getByTestId, getByRole } = render(
        <ImageBlockEditor
          selectedBlock={null}
          onChange={onChange}
          onDelete={onDelete}
        />
      )
      expect(await getByTestId('imageSrcStack')).toBeInTheDocument()
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue('')
    })
  })
  describe('Existing ImageBlock', () => {
    it('shows placeholders', async () => {
      const { getByTestId, getByRole } = render(
        <ImageBlockEditor
          selectedBlock={image}
          onChange={onChange}
          onDelete={onDelete}
        />
      )
      expect(await getByTestId('imageSrcStack')).toBeInTheDocument()
      const textBox = await getByRole('textbox')
      expect(textBox).toHaveValue(image.src)
    })
    it('displays validation messages ', async () => {
      const { getByRole, getByText } = render(
        <ImageBlockEditor
          selectedBlock={image}
          onChange={onChange}
          onDelete={onDelete}
        />
      )
      const textBox = await getByRole('textbox')
      fireEvent.change(textBox, {
        target: { value: '' }
      })
      fireEvent.blur(textBox)
      await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
      fireEvent.change(textBox, {
        target: { value: 'example.com/123' }
      })
      fireEvent.blur(textBox)
      await waitFor(() =>
        expect(getByText('Please enter a valid url')).toBeInTheDocument()
      )
    })
  })
})
