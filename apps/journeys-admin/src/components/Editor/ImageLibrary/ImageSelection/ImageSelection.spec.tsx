import { render } from '@testing-library/react'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'
import { ImageSelection } from './ImageSelection'

describe('ImageSelection', () => {
  const image: ImageBlock = {
    id: 'Image Title',
    __typename: 'ImageBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
    alt: 'image.jpg',
    width: 1920,
    height: 1080,
    blurhash: ''
  }

  it('should display Image Selection', () => {
    const { getByText, getByTestId } = render(<ImageSelection image={image} />)

    expect(getByText('Image Title')).toBeInTheDocument()
    expect(getByText('1920 x 1080 pixels')).toBeInTheDocument()
    expect(getByTestId('DeleteOutlineIcon')).toBeInTheDocument()
  })

  it('should display default text and icon on no image uploaded', () => {
    const { getByText, getByTestId } = render(<ImageSelection />)

    expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    expect(getByTestId('AddIcon')).toBeInTheDocument()
    expect(getByText('Select Image')).toBeInTheDocument()
    expect(getByText('Upload your image')).toBeInTheDocument()
  })
})
