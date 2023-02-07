import { render } from '@testing-library/react'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from './ImageBlockHeader'

describe('ImageBlockHeader', () => {
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

  it('should display applied state correctly', () => {
    const { getByText, getByTestId } = render(
      <ImageBlockHeader selectedBlock={image} />
    )

    expect(getByText('Selected image')).toBeInTheDocument()
    expect(
      getByText(`${image.width} x ${image.height} pixels`)
    ).toBeInTheDocument()
    expect(getByTestId('imageBlockHeaderDelete')).toBeInTheDocument()
  })

  it('should display default text for no image selected', () => {
    const { getByText, getByTestId } = render(
      <ImageBlockHeader selectedBlock={null} />
    )

    expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    expect(getByText('Select image')).toBeInTheDocument()
  })

  it('should display source state correctly', () => {
    const { getByText, getByTestId } = render(
      <ImageBlockHeader selectedBlock={null} showAdd />
    )

    expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    expect(getByTestId('AddIcon')).toBeInTheDocument()
    expect(getByText('Select image')).toBeInTheDocument()
  })
})
