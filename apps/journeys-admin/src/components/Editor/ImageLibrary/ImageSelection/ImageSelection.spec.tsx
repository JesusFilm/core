import { fireEvent, render } from '@testing-library/react'
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

  it('should display states correctly when clicking apply', () => {
    const { getByText, getByTestId } = render(
      <ImageSelection
        image={image}
        startPanel={{
          name: 'apply',
          heading: 'Apply this image?',
          hasImage: true
        }}
      />
    )

    expect(getByText('Apply this image?')).toBeInTheDocument()
    fireEvent.click(getByTestId('CheckIcon'))

    expect(getByText('Selected image')).toBeInTheDocument()
    expect(getByText('1920 x 1080 pixels')).toBeInTheDocument()
    expect(getByTestId('DeleteOutlineIcon')).toBeInTheDocument()
  })

  it('should display states correctly when clicking decline', () => {
    const { getByText, getByTestId } = render(
      <ImageSelection
        image={image}
        startPanel={{
          name: 'apply',
          heading: 'Apply this image?',
          hasImage: true
        }}
      />
    )

    expect(getByText('Apply this image?')).toBeInTheDocument()
    fireEvent.click(getByTestId('CancelIcon'))

    expect(getByText('No image selected')).toBeInTheDocument()
  })

  it('should display default text for no image selected', () => {
    const { getByText, getByTestId } = render(<ImageSelection />)

    expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    expect(getByText('No image selected')).toBeInTheDocument()
  })
})
