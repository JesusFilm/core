import { render } from '@testing-library/react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'

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

  it('should render selected image block', () => {
    const { getByText, getByTestId } = render(
      <ImageBlockHeader selectedBlock={image} />
    )

    expect(getByText('Selected Image')).toBeInTheDocument()
    expect(
      getByText(`${image.width} x ${image.height} pixels`)
    ).toBeInTheDocument()
    expect(getByTestId('imageBlockHeaderDelete')).toBeInTheDocument()
  })

  it('should render default text for no image selected', () => {
    const { getByText, getByTestId } = render(
      <ImageBlockHeader selectedBlock={null} />
    )

    expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    expect(getByText('No Image Selected')).toBeInTheDocument()
  })

  it('should render text for background image', () => {
    const { getByText, getByTestId } = render(
      <ImageBlockHeader showAdd selectedBlock={null} />
    )
    expect(getByTestId('Plus2Icon')).toBeInTheDocument()
    expect(getByText('Select Image')).toBeInTheDocument()
  })

  it('should render placeholder', () => {
    const { getByText, getByTestId } = render(
      <ImageBlockHeader selectedBlock={null} showAdd />
    )

    expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    expect(getByTestId('Plus2Icon')).toBeInTheDocument()
    expect(getByText('Select Image')).toBeInTheDocument()
  })

  it('should render error state', () => {
    const { getByText, getByTestId } = render(
      <ImageBlockHeader selectedBlock={null} error />
    )
    expect(getByText('Upload failed')).toBeInTheDocument()
    expect(getByTestId('ImageXIcon')).toBeInTheDocument()
  })
})
