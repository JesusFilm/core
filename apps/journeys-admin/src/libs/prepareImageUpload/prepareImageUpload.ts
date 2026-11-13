import { ErrorCode } from 'react-dropzone'

import { MAX_IMAGE_UPLOAD_BYTES } from '../useImageUpload/constants'

type DetectedImageType = 'png' | 'jpeg' | 'gif' | 'heif' | 'webp' | 'svg'

// Longest edge, in pixels, an SVG is rasterized to. Vectors stay sharp at any
// size, so small icons are scaled up to fill a full-bleed card background.
export const SVG_RASTER_LONGEST_EDGE = 2048

// Browsers size an SVG with no viewBox and no usable width/height at 300×150.
const DEFAULT_SVG_WIDTH = 300
const DEFAULT_SVG_HEIGHT = 150

// Bytes read to identify a file: enough for the ftyp box of a HEIF/AVIF file,
// whose compatible brands follow its major brand.
const HEADER_BYTES = 64

// ISO-BMFF major brands of HEIC/HEIF images.
const HEIF_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'mif1',
  'msf1'
])

// AVIF is not accepted, even when a HEIF major brand ('mif1', 'msf1') carries
// it as a compatible brand.
const AVIF_BRANDS = new Set(['avif', 'avis'])

/**
 * Thrown when a file cannot be uploaded as an image. `code` is the
 * react-dropzone error the upload UI already knows how to explain.
 */
export class ImageUploadFileError extends Error {
  constructor(readonly code: ErrorCode) {
    super(code)
    this.name = 'ImageUploadFileError'
  }
}

function matchesBytes(
  bytes: Uint8Array,
  signature: number[],
  offset = 0
): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte)
}

function readAscii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end))
}

// The major brand then the compatible brands of a file that starts with an
// ISO-BMFF ftyp box, else none.
function readFtypBrands(bytes: Uint8Array): string[] {
  if (readAscii(bytes, 4, 8) !== 'ftyp') return []
  const boxSize =
    ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0
  const end = boxSize >= 16 ? Math.min(boxSize, bytes.length) : bytes.length
  const brands = [readAscii(bytes, 8, 12)]
  // Bytes 12-16 hold the minor version, not a brand
  for (let offset = 16; offset + 4 <= end; offset += 4)
    brands.push(readAscii(bytes, offset, offset + 4))
  return brands
}

function parseSvg(text: string): SVGSVGElement | undefined {
  const document = new DOMParser().parseFromString(text, 'image/svg+xml')
  if (document.getElementsByTagName('parsererror').length > 0) return
  const root = document.documentElement
  if (root.localName !== 'svg') return
  return root as unknown as SVGSVGElement
}

/**
 * Identifies an image by its contents, not its name or the browser-reported
 * MIME type — both come from the file extension, so a renamed text file
 * would otherwise pass as an image.
 */
export async function detectImageType(
  file: Blob
): Promise<DetectedImageType | undefined> {
  const bytes = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer())

  if (matchesBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return 'png'
  if (matchesBytes(bytes, [0xff, 0xd8, 0xff])) return 'jpeg'
  const gifHeader = readAscii(bytes, 0, 6)
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') return 'gif'
  const brands = readFtypBrands(bytes)
  if (
    HEIF_BRANDS.has(brands[0]) &&
    !brands.some((brand) => AVIF_BRANDS.has(brand))
  )
    return 'heif'
  if (readAscii(bytes, 0, 4) === 'RIFF' && readAscii(bytes, 8, 12) === 'WEBP')
    return 'webp'

  if (parseSvg(await file.text()) != null) return 'svg'
}

// Formats people pick by mistake, matched on their leading bytes. Only used to
// report what a rejected file really was; none of these can be uploaded.
const OTHER_FILE_SIGNATURES: Array<{
  type: string
  matches: (bytes: Uint8Array) => boolean
}> = [
  { type: 'pdf', matches: (bytes) => readAscii(bytes, 0, 5) === '%PDF-' },
  // DOCX, XLSX and PPTX are ZIP archives too; telling them apart means
  // reading inside the archive
  {
    type: 'zip',
    matches: (bytes) => matchesBytes(bytes, [0x50, 0x4b, 0x03, 0x04])
  },
  { type: 'gzip', matches: (bytes) => matchesBytes(bytes, [0x1f, 0x8b]) },
  { type: 'rar', matches: (bytes) => readAscii(bytes, 0, 4) === 'Rar!' },
  {
    type: 'avif',
    matches: (bytes) =>
      readFtypBrands(bytes).some((brand) => AVIF_BRANDS.has(brand))
  },
  // Any other ISO-BMFF brand: MP4, MOV, M4A, 3GP
  { type: 'mp4', matches: (bytes) => readAscii(bytes, 4, 8) === 'ftyp' },
  {
    type: 'webm',
    matches: (bytes) => matchesBytes(bytes, [0x1a, 0x45, 0xdf, 0xa3])
  },
  {
    type: 'wav',
    matches: (bytes) =>
      readAscii(bytes, 0, 4) === 'RIFF' && readAscii(bytes, 8, 12) === 'WAVE'
  },
  {
    type: 'avi',
    matches: (bytes) =>
      readAscii(bytes, 0, 4) === 'RIFF' && readAscii(bytes, 8, 12) === 'AVI '
  },
  {
    type: 'mp3',
    matches: (bytes) =>
      readAscii(bytes, 0, 3) === 'ID3' ||
      (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
  },
  { type: 'bmp', matches: (bytes) => readAscii(bytes, 0, 2) === 'BM' },
  {
    type: 'tiff',
    matches: (bytes) =>
      matchesBytes(bytes, [0x49, 0x49, 0x2a, 0x00]) ||
      matchesBytes(bytes, [0x4d, 0x4d, 0x00, 0x2a])
  },
  { type: 'psd', matches: (bytes) => readAscii(bytes, 0, 4) === '8BPS' }
]

function isText(bytes: Uint8Array): boolean {
  if (bytes.includes(0)) return false
  try {
    // stream: a multi-byte character cut off at the end of the sample is fine
    new TextDecoder('utf-8', { fatal: true }).decode(bytes, { stream: true })
    return true
  } catch {
    return false
  }
}

/**
 * Names what a file really contains, for upload-failure analytics: the image
 * type when it is one, else a common non-image format, else 'text' or
 * 'unknown'.
 */
export async function describeFileContents(file: Blob): Promise<string> {
  const imageType = await detectImageType(file)
  if (imageType != null) return imageType

  const bytes = new Uint8Array(await file.slice(0, 512).arrayBuffer())
  if (bytes.length === 0) return 'empty'
  const signature = OTHER_FILE_SIGNATURES.find(({ matches }) => matches(bytes))
  if (signature != null) return signature.type
  if (!isText(bytes)) return 'unknown'
  return /^\s*<(!doctype\s+html|html)[\s>]/i.test(readAscii(bytes, 0, 512))
    ? 'html'
    : 'text'
}

// CSS pixels per absolute unit, at the 96 px-per-inch reference browsers use
const CSS_PX_PER_UNIT: Record<string, number> = {
  px: 1,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  pt: 96 / 72,
  pc: 16
}

// A width or height in CSS pixels. Relative units (%, em) are left out, so
// the SVG falls back to the browser's default size as it would on a page.
function parseLength(value: string | null): number | undefined {
  if (value == null) return
  const match = /^\s*(\d*\.?\d+)\s*(px|in|cm|mm|pt|pc)?\s*$/.exec(value)
  if (match == null) return
  const length = Number(match[1]) * CSS_PX_PER_UNIT[match[2] ?? 'px']
  return length > 0 ? length : undefined
}

function parseViewBox(
  value: string | null
): { width: number; height: number } | undefined {
  if (value == null) return
  const parts = value
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  if (parts.length !== 4 || parts.some(Number.isNaN)) return
  const [, , width, height] = parts
  if (width <= 0 || height <= 0) return
  return { width, height }
}

/**
 * Returns the SVG with a viewBox and pixel width/height at the raster size.
 * Without explicit dimensions Firefox refuses to draw an SVG to a canvas, and
 * without a viewBox the drawing would not scale with them.
 */
function sizeSvgForRaster(svg: SVGSVGElement): {
  markup: string
  width: number
  height: number
} {
  const width = parseLength(svg.getAttribute('width'))
  const height = parseLength(svg.getAttribute('height'))
  const viewBox = parseViewBox(svg.getAttribute('viewBox'))

  const intrinsic = viewBox ?? {
    width: width ?? DEFAULT_SVG_WIDTH,
    height: height ?? DEFAULT_SVG_HEIGHT
  }
  if (viewBox == null)
    svg.setAttribute('viewBox', `0 0 ${intrinsic.width} ${intrinsic.height}`)

  const scale =
    SVG_RASTER_LONGEST_EDGE / Math.max(intrinsic.width, intrinsic.height)
  const rasterWidth = Math.max(1, Math.round(intrinsic.width * scale))
  const rasterHeight = Math.max(1, Math.round(intrinsic.height * scale))
  svg.setAttribute('width', String(rasterWidth))
  svg.setAttribute('height', String(rasterHeight))

  return {
    markup: new XMLSerializer().serializeToString(svg),
    width: rasterWidth,
    height: rasterHeight
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () =>
      reject(new ImageUploadFileError(ErrorCode.FileInvalidType))
    image.src = src
  })
}

/**
 * Draws an SVG to a PNG. Next.js' image optimizer refuses SVG responses, and
 * Cloudflare serves the `/public` variant without a `.svg` extension that
 * would let next/image skip optimization, so an uploaded SVG never renders.
 * Rasterizing also keeps raw SVG (which can carry scripts) out of storage.
 */
async function rasterizeSvg(file: File): Promise<File> {
  const svg = parseSvg(await file.text())
  if (svg == null) throw new ImageUploadFileError(ErrorCode.FileInvalidType)

  const { markup, width, height } = sizeSvgForRaster(svg)
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
  try {
    const image = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (context == null) throw new Error('Canvas 2D context unavailable')
    context.drawImage(image, 0, 0, width, height)

    const png = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    )
    if (png == null) throw new Error('Could not encode SVG as PNG')
    if (png.size > MAX_IMAGE_UPLOAD_BYTES)
      throw new ImageUploadFileError(ErrorCode.FileTooLarge)

    const name = `${file.name.replace(/\.svg$/i, '')}.png`
    return new File([png], name, { type: 'image/png' })
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Checks a file really is one of the accepted image types and returns the
 * file to upload: the original for raster images, a PNG rendering for SVG.
 * Throws {@link ImageUploadFileError} when the file cannot be uploaded.
 */
export async function prepareImageUpload(file: File): Promise<File> {
  const type = await detectImageType(file)
  if (type == null) throw new ImageUploadFileError(ErrorCode.FileInvalidType)
  if (type === 'svg') return await rasterizeSvg(file)
  return file
}
