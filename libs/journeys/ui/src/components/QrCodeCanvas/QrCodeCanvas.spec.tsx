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

  it('draws the value at level M, black on white, at the size it is shown', () => {
    render(<QrCodeCanvas value="https://short.nextstep.is/eur-en" size={160} />)

    const canvas = screen.getByRole('img', {
      name: 'https://short.nextstep.is/eur-en'
    })
    expect(canvas).toHaveAttribute('width', '160')
    expect(canvas).toHaveStyle({ width: '160px', height: '160px' })
    expect(drawn.mock.calls[0][0]).toMatchObject({
      value: 'https://short.nextstep.is/eur-en',
      size: 160,
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
    const url = 'https://short.nextstep.is/eur-en'

    beforeEach(() => {
      vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', false)
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.unstubAllGlobals()
    })

    it('draws the code off-screen at 1024 px and reads it back as a PNG', () => {
      const toDataURL = vi
        .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
        .mockReturnValue('data:image/png;base64,QR')

      expect(qrCodePngDataUrl(url)).toBe('data:image/png;base64,QR')
      expect(toDataURL).toHaveBeenCalledWith('image/png')
      expect(drawn.mock.calls[0][0]).toMatchObject({
        value: url,
        size: QR_CODE_PNG_SIZE,
        level: 'M',
        fgColor: '#000000',
        bgColor: '#FFFFFF'
      })
    })

    it('redraws a high-density bitmap at 1024 px when a 2D context is available', () => {
      vi.stubGlobal('devicePixelRatio', 2)
      const drawImage = vi.fn()
      vi.stubGlobal('Path2D', vi.fn())
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        drawImage,
        scale: vi.fn(),
        fillRect: vi.fn(),
        fill: vi.fn()
      } as unknown as CanvasRenderingContext2D)
      const toDataURL = vi
        .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
        .mockReturnValue('data:image/png;base64,RESIZED')

      expect(qrCodePngDataUrl(url)).toBe('data:image/png;base64,RESIZED')
      expect(drawImage).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        0,
        0,
        1024,
        1024
      )
      expect(toDataURL).toHaveBeenCalledTimes(1)
    })

    it('leaves nothing on the page after drawing', () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('x')

      qrCodePngDataUrl(url)

      expect(document.querySelector('canvas')).toBeNull()
    })

    it('saves the PNG under the given file name through a transient link', () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
        'data:image/png;base64,QR'
      )
      const click = vi
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => undefined)

      downloadQrCodePng(url, 'christmas-2026-eur-en.png')

      expect(click).toHaveBeenCalledTimes(1)
      const clicked = click.mock.contexts[0] as HTMLAnchorElement
      expect(clicked.download).toBe('christmas-2026-eur-en.png')
      expect(clicked.href).toBe('data:image/png;base64,QR')
      expect(document.body.contains(clicked)).toBe(false)
    })
  })
})
