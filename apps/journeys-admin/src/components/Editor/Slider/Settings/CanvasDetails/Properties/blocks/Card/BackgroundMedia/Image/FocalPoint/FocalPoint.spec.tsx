import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type MockedFunction } from 'vitest'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'

import { FocalPoint } from './FocalPoint'
import { calculatePoint } from './utils/calculatePoint'

vi.mock('./utils/calculatePoint')

const mockedCalculatePoint = calculatePoint as MockedFunction<
  typeof calculatePoint
>

// jsdom has no PointerEvent, so fireEvent would drop the mouse fields
class PointerEventPolyfill extends MouseEvent {
  pointerId: number

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init)
    this.pointerId = init.pointerId ?? 0
  }
}

describe('FocalPoint', () => {
  const updateImageBlock = vi.fn()

  beforeAll(() => {
    window.PointerEvent = PointerEventPolyfill as typeof PointerEvent
    // jsdom does not implement pointer capture
    HTMLElement.prototype.setPointerCapture = vi.fn()
  })

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
    focalTop: 50,
    customizable: null
  }

  const imageBlockResult = {
    src: imageBlock.src,
    alt: imageBlock.alt,
    blurhash: imageBlock.blurhash,
    width: imageBlock.width,
    height: imageBlock.height,
    focalLeft: 50,
    focalTop: 50
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function renderFocalPoint(block: ImageBlock = imageBlock): {
    cache: InMemoryCache
    unmount: () => void
  } {
    const cache = new InMemoryCache()
    cache.restore({ [`ImageBlock:${block.id}`]: { ...block } })
    const { unmount } = render(
      <MockedProvider cache={cache}>
        <FocalPoint imageBlock={block} updateImageBlock={updateImageBlock} />
      </MockedProvider>
    )
    return { cache, unmount }
  }

  // previews of moves are written on the next animation frame
  async function waitForCachedFocalPoint(
    cache: InMemoryCache,
    focalLeft: number,
    focalTop: number
  ): Promise<void> {
    await waitFor(() =>
      expect(cachedFocalPoint(cache)).toEqual({ focalLeft, focalTop })
    )
  }

  function startDrag(point: { x: number; y: number }): HTMLElement {
    mockedCalculatePoint.mockReturnValueOnce(point)
    const image = screen.getByRole('img')
    fireEvent.pointerDown(image, { button: 0, pointerId: 1 })
    return image
  }

  function cachedFocalPoint(cache: InMemoryCache): {
    focalLeft: unknown
    focalTop: unknown
  } {
    const cached = cache.extract()[`ImageBlock:${imageBlock.id}`]
    return { focalLeft: cached?.focalLeft, focalTop: cached?.focalTop }
  }

  it('renders FocalPoint', () => {
    renderFocalPoint()

    expect(screen.getByText('Adjust View')).toBeInTheDocument()
    expect(screen.getByRole('img').getAttribute('src')).toBe(
      'https://imagedelivery.net/cloudflare-key/uploadId/public'
    )
    expect(screen.getByTestId('focal-point-dot')).toBeInTheDocument()
  })

  it('should not render FocalPoint when image block src is null', () => {
    renderFocalPoint({ ...imageBlock, src: null })
    expect(screen.queryByText('Adjust View')).not.toBeInTheDocument()
  })

  it('saves the point when the image is tapped', () => {
    const { cache } = renderFocalPoint()

    const image = startDrag({ x: 25, y: 25 })
    fireEvent.pointerUp(image, { pointerId: 1 })

    expect(cachedFocalPoint(cache)).toEqual({ focalLeft: 25, focalTop: 25 })
    expect(updateImageBlock).toHaveBeenCalledTimes(1)
    expect(updateImageBlock).toHaveBeenCalledWith(
      { ...imageBlockResult, focalTop: 25, focalLeft: 25 },
      true,
      imageBlock
    )
  })

  it('previews moves but saves once when the drag is released', async () => {
    const { cache } = renderFocalPoint()

    const image = startDrag({ x: 30, y: 30 })
    mockedCalculatePoint.mockReturnValueOnce({ x: 60, y: 60 })
    fireEvent.pointerMove(image, { pointerId: 1 })
    await waitForCachedFocalPoint(cache, 60, 60)
    mockedCalculatePoint.mockReturnValueOnce({ x: 75, y: 75 })
    fireEvent.pointerMove(image, { pointerId: 1 })
    await waitForCachedFocalPoint(cache, 75, 75)
    expect(updateImageBlock).not.toHaveBeenCalled()

    fireEvent.pointerUp(image, { pointerId: 1 })

    expect(updateImageBlock).toHaveBeenCalledTimes(1)
    expect(updateImageBlock).toHaveBeenCalledWith(
      { ...imageBlockResult, focalTop: 75, focalLeft: 75 },
      true,
      imageBlock
    )
  })

  it('writes at most one preview per frame, with the latest point', async () => {
    const { cache } = renderFocalPoint()
    const writeFragment = vi.spyOn(cache, 'writeFragment')

    const image = startDrag({ x: 30, y: 30 })
    mockedCalculatePoint
      .mockReturnValueOnce({ x: 40, y: 40 })
      .mockReturnValueOnce({ x: 70, y: 20 })
    fireEvent.pointerMove(image, { pointerId: 1 })
    fireEvent.pointerMove(image, { pointerId: 1 })

    expect(writeFragment).not.toHaveBeenCalled()
    await waitForCachedFocalPoint(cache, 70, 20)
    expect(writeFragment).toHaveBeenCalledTimes(1)
  })

  it('does not preview moves without a pressed pointer', () => {
    const { cache } = renderFocalPoint()

    fireEvent.pointerMove(screen.getByRole('img'), { pointerId: 1 })

    expect(mockedCalculatePoint).not.toHaveBeenCalled()
    expect(cachedFocalPoint(cache)).toEqual({ focalLeft: 50, focalTop: 50 })
  })

  it('ignores other pointers until the dragging one is released', () => {
    renderFocalPoint()

    const image = startDrag({ x: 30, y: 30 })
    fireEvent.pointerDown(image, { button: 0, pointerId: 2 })
    fireEvent.pointerMove(image, { pointerId: 2 })
    fireEvent.pointerUp(image, { pointerId: 2 })

    expect(mockedCalculatePoint).toHaveBeenCalledTimes(1)
    expect(updateImageBlock).not.toHaveBeenCalled()

    fireEvent.pointerUp(image, { pointerId: 1 })

    expect(updateImageBlock).toHaveBeenCalledWith(
      { ...imageBlockResult, focalTop: 30, focalLeft: 30 },
      true,
      imageBlock
    )
  })

  it('does not save when released at the saved point', () => {
    renderFocalPoint()

    const image = startDrag({ x: 50, y: 50 })
    fireEvent.pointerUp(image, { pointerId: 1 })

    expect(updateImageBlock).not.toHaveBeenCalled()
  })

  it('restores the saved point when the drag is cancelled', async () => {
    const { cache } = renderFocalPoint()

    const image = startDrag({ x: 80, y: 20 })
    await waitForCachedFocalPoint(cache, 80, 20)
    fireEvent.pointerCancel(image, { pointerId: 1 })

    expect(cachedFocalPoint(cache)).toEqual({ focalLeft: 50, focalTop: 50 })
    expect(updateImageBlock).not.toHaveBeenCalled()
    expect(screen.getByTestId('focal-point-dot')).toHaveStyle({
      top: '50%',
      left: '50%'
    })
  })

  it('restores the saved point when Escape is pressed mid-drag', async () => {
    const { cache } = renderFocalPoint()

    const image = startDrag({ x: 80, y: 20 })
    await waitForCachedFocalPoint(cache, 80, 20)
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.pointerUp(image, { pointerId: 1 })

    expect(cachedFocalPoint(cache)).toEqual({ focalLeft: 50, focalTop: 50 })
    expect(updateImageBlock).not.toHaveBeenCalled()
  })

  it('cancels the drag before an undo or redo hotkey runs', async () => {
    const { cache } = renderFocalPoint()
    const hotkey = vi.fn(() => cachedFocalPoint(cache))
    document.addEventListener('keydown', hotkey)

    const image = startDrag({ x: 80, y: 20 })
    await waitForCachedFocalPoint(cache, 80, 20)
    fireEvent.keyDown(document, { key: 'z', metaKey: true })
    fireEvent.pointerUp(image, { pointerId: 1 })
    document.removeEventListener('keydown', hotkey)

    // the editor's hotkey still runs, after the preview is reverted
    expect(hotkey).toHaveReturnedWith({ focalLeft: 50, focalTop: 50 })
    expect(updateImageBlock).not.toHaveBeenCalled()
  })

  it('restores the saved point when unmounted mid-drag', async () => {
    const { cache, unmount } = renderFocalPoint()

    startDrag({ x: 80, y: 20 })
    await waitForCachedFocalPoint(cache, 80, 20)
    unmount()

    expect(cachedFocalPoint(cache)).toEqual({ focalLeft: 50, focalTop: 50 })
    expect(updateImageBlock).not.toHaveBeenCalled()
  })
})
