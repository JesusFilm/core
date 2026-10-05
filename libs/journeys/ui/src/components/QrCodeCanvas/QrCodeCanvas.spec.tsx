import { render, screen } from '@testing-library/react'

import {
  QR_CODE_PNG_SIZE,
  QrCodeCanvas,
  downloadQrCodePng,
  qrCodePngDataUrl
} from './QrCodeCanvas'

/** The props each draw hands qrcode.react, recorded around the real canvas. */
const drawn = vi.hoisted(() => vi.fn())

vi.mock('qrcode.react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('qrcode.react')>()
  const { createElement, forwardRef } = await import(
    /* webpackChunkName: "react" */ 'react'
  )
  type Props = import('react').ComponentProps<typeof actual.QRCodeCanvas>
  return {
    ...actual,
    QRCodeCanvas: forwardRef<HTMLCanvasElement, Props>(
      function QRCodeCanvasSpy(props, ref) {
        drawn(props)
        return createElement(actual.QRCodeCanvas, { ...props, ref })
      }
    )
  }
})

describe('QrCodeCanvas', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: vi.fn(),
      writable: true,
      configurable: true
    })
  })

  beforeEach(() => vi.clearAllMocks())

  it('draws the value at level M, black on white, at 1024 px shown at the given size', () => {
    render(<QrCodeCanvas value="https://short.nextstep.is/eur-en" size={160} />)

    const canvas = screen.getByRole('img', {
      name: 'https://short.nextstep.is/eur-en'
    })
    expect(canvas).toHaveAttribute('width', String(QR_CODE_PNG_SIZE))
    expect(canvas).toHaveStyle({ width: '160px', height: '160px' })
    expect(drawn.mock.calls[0][0]).toMatchObject({
      value: 'https://short.nextstep.is/eur-en',
      size: 1024,
      level: 'M',
      fgColor: '#000000',
      bgColor: '#FFFFFF'
    })
  })

  it('shows a loading skeleton', () => {
    render(<QrCodeCanvas value="url" loading />)

    expect(screen.getByLabelText('Loading QR code')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows an empty tile without a value', () => {
    render(<QrCodeCanvas />)

    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })

  describe('download', () => {
    function drawnCanvas(width = QR_CODE_PNG_SIZE): HTMLCanvasElement {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = width
      vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,QR')
      return canvas
    }

    it('reads a 1024 px canvas back as a PNG', () => {
      const canvas = drawnCanvas()

      expect(qrCodePngDataUrl(canvas)).toBe('data:image/png;base64,QR')
      expect(canvas.toDataURL).toHaveBeenCalledWith('image/png')
    })

    it('redraws a bitmap of another size at 1024 px when a 2D context is available', () => {
      // The source is spied before the prototype so its own spy stays separate.
      const source = drawnCanvas(2048)
      const drawImage = vi.fn()
      const getContext = vi
        .spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
      const toDataURL = vi
        .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
        .mockReturnValue('data:image/png;base64,RESIZED')

      expect(qrCodePngDataUrl(source)).toBe('data:image/png;base64,RESIZED')
      expect(drawImage).toHaveBeenCalledWith(source, 0, 0, 1024, 1024)
      expect(toDataURL).toHaveBeenCalledWith('image/png')
      expect(source.toDataURL).not.toHaveBeenCalled()
      getContext.mockRestore()
      toDataURL.mockRestore()
    })

    it('saves the PNG under the given file name through a transient link', () => {
      const canvas = drawnCanvas()
      const click = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => undefined)

      downloadQrCodePng(canvas, 'christmas-2026-eur-en.png')

      expect(click).toHaveBeenCalledTimes(1)
      const clicked = click.mock.contexts[0] as HTMLAnchorElement
      expect(clicked.download).toBe('christmas-2026-eur-en.png')
      expect(clicked.href).toBe('data:image/png;base64,QR')
      expect(document.body.contains(clicked)).toBe(false)
      click.mockRestore()
    })
  })
})
