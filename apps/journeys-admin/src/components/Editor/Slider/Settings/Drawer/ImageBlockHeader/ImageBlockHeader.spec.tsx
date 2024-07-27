import { render, screen } from '@testing-library/react'

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
    render(<ImageBlockHeader selectedBlock={image} />)

    expect(screen.getByText('Selected Image')).toBeInTheDocument()
    expect(
      screen.getByText(`${image.width} x ${image.height} pixels`)
    ).toBeInTheDocument()
    expect(screen.getByTestId('imageBlockHeaderDelete')).toBeInTheDocument()
  })

  it('should render default text for no image selected', () => {
    render(<ImageBlockHeader selectedBlock={null} />)

    expect(
      screen.getByTestId('imageBlockThumbnailPlaceholder')
    ).toBeInTheDocument()
    expect(screen.getByText('No Image Selected')).toBeInTheDocument()
  })

  it('should render text for background image', () => {
    render(<ImageBlockHeader showAdd selectedBlock={null} />)
    expect(screen.getByTestId('Plus2Icon')).toBeInTheDocument()
    expect(screen.getByText('Select Image')).toBeInTheDocument()
  })

  it('should render placeholder', () => {
    render(<ImageBlockHeader selectedBlock={null} showAdd />)

    expect(
      screen.getByTestId('imageBlockThumbnailPlaceholder')
    ).toBeInTheDocument()
    expect(screen.getByTestId('Plus2Icon')).toBeInTheDocument()
    expect(screen.getByText('Select Image')).toBeInTheDocument()
  })

  it('should render error state', () => {
    render(<ImageBlockHeader selectedBlock={null} error />)
    expect(screen.getByText('Upload failed')).toBeInTheDocument()
    expect(screen.getByTestId('ImageXIcon')).toBeInTheDocument()
  })
})
