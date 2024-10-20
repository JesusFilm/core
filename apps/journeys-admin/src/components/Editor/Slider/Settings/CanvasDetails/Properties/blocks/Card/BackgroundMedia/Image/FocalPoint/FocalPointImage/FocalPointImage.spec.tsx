import { fireEvent, render } from '@testing-library/react'
import React from 'react'

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
    const { getByAltText, getByTestId } = render(
      <FocalPointImage {...mockProps} />
    )

    expect(getByAltText('Test Image')).toBeInTheDocument()
    expect(getByTestId('focal-point-dot')).toBeInTheDocument()
  })

  it('renders placeholder when no image is provided', () => {
    const { getByTestId } = render(
      <FocalPointImage {...mockProps} imageBlock={undefined} />
    )

    expect(getByTestId('InsertPhotoRoundedIcon')).toBeInTheDocument()
  })

  it('calls handleClick when clicked', () => {
    const { getByTestId } = render(<FocalPointImage {...mockProps} />)

    fireEvent.click(getByTestId('focal-point-image'))
    expect(mockProps.handleClick).toHaveBeenCalled()
  })

  it('calls onDragStart when dot is clicked', () => {
    const { getByTestId } = render(<FocalPointImage {...mockProps} />)

    fireEvent.mouseDown(getByTestId('focal-point-dot'))
    expect(mockProps.onDragStart).toHaveBeenCalled()
  })
})
