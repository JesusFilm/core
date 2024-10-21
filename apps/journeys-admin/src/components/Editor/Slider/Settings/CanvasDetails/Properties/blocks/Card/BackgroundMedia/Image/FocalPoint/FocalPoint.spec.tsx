import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'

import { FocalPoint } from './FocalPoint'
import { calculatePoint } from './utils/calculatePoint'

jest.mock('./utils/calculatePoint')

const mockedCalculatePoint = calculatePoint as jest.MockedFunction<
  typeof calculatePoint
>

describe('FocalPoint', () => {
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
    scale: null,
    focalLeft: 50,
    focalTop: 50
  }

  const updateImageBlock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders FocalPoint', () => {
    render(
      <FocalPoint imageBlock={imageBlock} updateImageBlock={updateImageBlock} />
    )

    expect(screen.getByText('Focal Point')).toBeInTheDocument()
    expect(screen.getByRole('img').getAttribute('src')).toBe(
      'https://imagedelivery.net/cloudflare-key/uploadId/public'
    )
    expect(screen.getByTestId('focal-point-dot')).toBeInTheDocument()
    expect(screen.getByLabelText('Left')).toHaveValue(50)
    expect(screen.getByLabelText('Top')).toHaveValue(50)
  })

  it('updates image block when image is clicked', async () => {
    mockedCalculatePoint.mockReturnValueOnce({ x: 25, y: 25 })
    render(
      <FocalPoint imageBlock={imageBlock} updateImageBlock={updateImageBlock} />
    )

    const image = screen.getByRole('img')
    fireEvent.click(image, { clientX: 25, clientY: 25 })

    await waitFor(() => {
      expect(updateImageBlock).toHaveBeenCalledWith({
        src: imageBlock.src,
        alt: imageBlock.alt,
        blurhash: imageBlock.blurhash,
        width: imageBlock.width,
        height: imageBlock.height,
        focalTop: 25,
        focalLeft: 25
      })
    })
  })

  it('updates image block when focal point is updated through dot', async () => {
    mockedCalculatePoint.mockReturnValueOnce({ x: 75, y: 75 })

    render(
      <FocalPoint imageBlock={imageBlock} updateImageBlock={updateImageBlock} />
    )

    const dot = screen.getByTestId('focal-point-dot')
    fireEvent.mouseDown(dot)
    fireEvent.mouseMove(document, { clientX: 75, clientY: 75 })
    fireEvent.mouseUp(document)

    await waitFor(() => {
      expect(updateImageBlock).toHaveBeenCalledWith({
        src: imageBlock.src,
        alt: imageBlock.alt,
        blurhash: imageBlock.blurhash,
        width: imageBlock.width,
        height: imageBlock.height,
        focalTop: 75,
        focalLeft: 75
      })
    })
  })

  it('updates image block when focal point is updated through input', async () => {
    render(
      <FocalPoint imageBlock={imageBlock} updateImageBlock={updateImageBlock} />
    )

    const inputX = screen.getByLabelText('Left')
    const inputY = screen.getByLabelText('Top')

    fireEvent.change(inputX, { target: { value: '75' } })
    fireEvent.change(inputY, { target: { value: '75' } })

    await waitFor(() => {
      expect(updateImageBlock).toHaveBeenCalledWith({
        src: imageBlock.src,
        alt: imageBlock.alt,
        blurhash: imageBlock.blurhash,
        width: imageBlock.width,
        height: imageBlock.height,
        focalTop: 75,
        focalLeft: 75
      })
    })
  })
})
