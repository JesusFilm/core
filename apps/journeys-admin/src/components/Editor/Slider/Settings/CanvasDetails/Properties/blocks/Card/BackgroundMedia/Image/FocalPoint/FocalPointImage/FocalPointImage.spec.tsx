import { fireEvent, render, screen } from '@testing-library/react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../../__generated__/BlockFields'

import { FocalPointImage } from './FocalPointImage'

describe('FocalPointImage', () => {
  const imageBlock: ImageBlock = {
    id: 'image.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
    alt: 'Test Image',
    width: 1920,
    height: 1080,
    blurhash: '',
    scale: null,
    focalLeft: 50,
    focalTop: 50
  }

  const mockProps = {
    imageBlock,
    imageRef: { current: null },
    localPosition: { x: 50, y: 50 },
    handleClick: jest.fn(),
    onDragStart: jest.fn()
  }

  it('renders correctly with image', () => {
    render(<FocalPointImage {...mockProps} />)

    expect(screen.getByRole('img').getAttribute('src')).toBe(
      'https://imagedelivery.net/cloudflare-key/uploadId/public'
    )
    expect(screen.getByAltText('Test Image')).toBeInTheDocument()
    expect(screen.getByTestId('focal-point-dot')).toBeInTheDocument()
  })

  it('renders placeholder when no image is provided', () => {
    render(<FocalPointImage {...mockProps} imageBlock={undefined} />)

    expect(screen.getByTestId('InsertPhotoRoundedIcon')).toBeInTheDocument()
  })

  it('calls handleClick when clicked', () => {
    render(<FocalPointImage {...mockProps} />)

    fireEvent.click(screen.getByRole('img'))
    expect(mockProps.handleClick).toHaveBeenCalled()
  })

  it('calls onDragStart when dot is clicked', () => {
    render(<FocalPointImage {...mockProps} />)

    fireEvent.mouseDown(screen.getByTestId('focal-point-dot'))
    expect(mockProps.onDragStart).toHaveBeenCalled()
  })
})
