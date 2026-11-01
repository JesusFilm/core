import { ErrorCode } from 'react-dropzone'

import {
  JPEG_FILE_BYTES,
  PNG_FILE_BYTES
} from './prepareImageUpload.mock'
import {
  ImageUploadFileError,
  SVG_RASTER_LONGEST_EDGE,
  detectImageType,
  prepareImageUpload
} from './prepareImageUpload'

function binaryFile(
  bytes: Uint8Array | number[],
  name: string,
  type: string
): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

function textFile(text: string, name: string, type: string): File {
  return new File([text], name, { type })
}

function asciiBytes(text: string): number[] {
  return Array.from(text, (char) => char.charCodeAt(0))
}

describe('prepareImageUpload', () => {
  describe('detectImageType', () => {
    it('should detect raster images by their signature', async () => {
      expect(
        await detectImageType(binaryFile(PNG_FILE_BYTES, 'a.png', 'image/png'))
      ).toBe('png')
      expect(
        await detectImageType(binaryFile(JPEG_FILE_BYTES, 'a.jpg', 'image/jpeg'))
      ).toBe('jpeg')
      expect(
        await detectImageType(
          binaryFile(asciiBytes('GIF89a'), 'a.gif', 'image/gif')
        )
      ).toBe('gif')
      expect(
        await detectImageType(
          binaryFile(
            [0, 0, 0, 0x18, ...asciiBytes('ftypheic')],
            'a.heic',
            'image/heic'
          )
        )
      ).toBe('heic')
    })

    it('should detect an SVG with a prolog and comments', async () => {
      const svg = `<?xml version="1.0"?>
        <!-- logo -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>`
      expect(
        await detectImageType(textFile(svg, 'a.svg', 'image/svg+xml'))
      ).toBe('svg')
    })

    it('should not detect a text file named like an image', async () => {
      expect(
        await detectImageType(textFile('hello world', 'a.png', 'image/png'))
      ).toBeUndefined()
      expect(
        await detectImageType(
          textFile('not <svg> at all', 'a.svg', 'image/svg+xml')
        )
      ).toBeUndefined()
    })

    it('should not detect well-formed XML that is not an SVG', async () => {
      expect(
        await detectImageType(
          textFile('<html><body/></html>', 'a.svg', 'image/svg+xml')
        )
      ).toBeUndefined()
    })
  })

  it('should return raster images unchanged', async () => {
    const file = binaryFile(PNG_FILE_BYTES, 'photo.png', 'image/png')
    expect(await prepareImageUpload(file)).toBe(file)
  })

  it('should reject a text file with an image extension', async () => {
    const error = await prepareImageUpload(
      textFile('just some text', 'notes.jpg', 'image/jpeg')
    ).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ImageUploadFileError)
    expect((error as ImageUploadFileError).code).toBe(ErrorCode.FileInvalidType)
  })

  describe('svg', () => {
    let drawnSvg: Blob | undefined
    let drawImage: ReturnType<typeof vi.fn>
    let pngSize: number
    let imageLoads: boolean

    beforeEach(() => {
      drawnSvg = undefined
      pngSize = 100
      imageLoads = true
      drawImage = vi.fn()

      vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
        drawnSvg = blob as Blob
        return 'blob:svg'
      })
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
      vi.stubGlobal(
        'Image',
        class {
          onload: (() => void) | null = null
          onerror: (() => void) | null = null
          set src(_value: string) {
            setTimeout(() => (imageLoads ? this.onload : this.onerror)?.())
          }
        }
      )
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        drawImage
      } as unknown as CanvasRenderingContext2D)
      vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
        function (callback) {
          callback(new Blob([new Uint8Array(pngSize)], { type: 'image/png' }))
        }
      )
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    it('should rasterize an SVG to a PNG at the raster size', async () => {
      const file = textFile(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect width="200" height="100"/></svg>',
        'logo.svg',
        'image/svg+xml'
      )

      const result = await prepareImageUpload(file)

      expect(result.name).toBe('logo.png')
      expect(result.type).toBe('image/png')
      expect(drawImage).toHaveBeenCalledWith(
        expect.anything(),
        0,
        0,
        SVG_RASTER_LONGEST_EDGE,
        SVG_RASTER_LONGEST_EDGE / 2
      )
      const markup = await drawnSvg?.text()
      expect(markup).toContain(`width="${SVG_RASTER_LONGEST_EDGE}"`)
      expect(markup).toContain(`height="${SVG_RASTER_LONGEST_EDGE / 2}"`)
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:svg')
    })

    it('should add a viewBox from width and height so the drawing scales', async () => {
      const file = textFile(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="48"/>',
        'icon.svg',
        'image/svg+xml'
      )

      await prepareImageUpload(file)

      expect(await drawnSvg?.text()).toContain('viewBox="0 0 24 48"')
      expect(drawImage).toHaveBeenCalledWith(
        expect.anything(),
        0,
        0,
        SVG_RASTER_LONGEST_EDGE / 2,
        SVG_RASTER_LONGEST_EDGE
      )
    })

    it('should reject an SVG the browser cannot render', async () => {
      imageLoads = false
      const file = textFile(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>',
        'broken.svg',
        'image/svg+xml'
      )

      await expect(prepareImageUpload(file)).rejects.toMatchObject({
        code: ErrorCode.FileInvalidType
      })
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:svg')
    })

    it('should reject an SVG whose PNG exceeds the upload limit', async () => {
      pngSize = 10_000_001
      const file = textFile(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"/>',
        'huge.svg',
        'image/svg+xml'
      )

      await expect(prepareImageUpload(file)).rejects.toMatchObject({
        code: ErrorCode.FileTooLarge
      })
    })
  })
})
