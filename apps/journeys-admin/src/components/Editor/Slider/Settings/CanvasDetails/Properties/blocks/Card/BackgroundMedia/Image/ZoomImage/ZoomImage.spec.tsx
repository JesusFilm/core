import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'

import { ZoomImage } from './ZoomImage'

describe('ZoomImage', () => {
  const updateImageBlock = jest.fn()

  const imageBlock: ImageBlock = {
    id: 'image.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
    alt: 'Test Image',
    width: 1920,
    height: 1080,
    blurhash: 'blurhash',
    scale: 100,
    focalLeft: 50,
    focalTop: 50
  }

  const imageBlockResult = {
    src: imageBlock.src,
    scale: 100
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders ZoomImage with initial scale', () => {
    render(
      <ZoomImage imageBlock={imageBlock} updateImageBlock={updateImageBlock} />
    )

    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByText('1.0 ×')).toBeInTheDocument()
  })

  it('should not render ZoomImage when image block src is null', () => {
    render(
      <ZoomImage
        imageBlock={{ ...imageBlock, src: null }}
        updateImageBlock={updateImageBlock}
      />
    )
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('updates image block scale when slider is moved', async () => {
    render(
      <ZoomImage imageBlock={imageBlock} updateImageBlock={updateImageBlock} />
    )

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: 1.5 } })
    fireEvent.mouseUp(slider)

    await waitFor(() => {
      expect(updateImageBlock).toHaveBeenCalledWith({
        src: imageBlock.src,
        scale: 150
      })
    })

    fireEvent.change(slider, { target: { value: 2.0 } })
    fireEvent.mouseUp(slider)

    await waitFor(() => {
      expect(updateImageBlock).toHaveBeenCalledWith({
        ...imageBlockResult,
        scale: 200
      })
    })

    fireEvent.change(slider, { target: { value: 1.0 } })
    fireEvent.mouseUp(slider)

    await waitFor(() => {
      expect(updateImageBlock).toHaveBeenCalledWith({
        ...imageBlockResult,
        scale: 100
      })
    })
  })

  it('initializes with correct zoom value based on image block scale', () => {
    const imageBlockWithScale: ImageBlock = {
      ...imageBlock,
      scale: 150
    }

    render(
      <ZoomImage
        imageBlock={imageBlockWithScale}
        updateImageBlock={updateImageBlock}
      />
    )

    expect(screen.getByRole('slider')).toHaveValue('1.5')
    expect(screen.getByText('1.5 ×')).toBeInTheDocument()
  })
})
