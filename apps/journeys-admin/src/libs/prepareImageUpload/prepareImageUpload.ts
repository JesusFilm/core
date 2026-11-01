import { ErrorCode } from 'react-dropzone'

import { MAX_IMAGE_UPLOAD_BYTES } from '../useImageUpload/constants'

type DetectedImageType = 'png' | 'jpeg' | 'gif' | 'heic' | 'svg'

// Longest edge, in pixels, an SVG is rasterized to. Vectors stay sharp at any
// size, so small icons are scaled up to fill a full-bleed card background.
export const SVG_RASTER_LONGEST_EDGE = 2048

// Browsers size an SVG with no viewBox and no usable width/height at 300×150.
const DEFAULT_SVG_WIDTH = 300
const DEFAULT_SVG_HEIGHT = 150

const HEIC_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'mif1',
  'msf1'
])

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
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())

  if (matchesBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return 'png'
  if (matchesBytes(bytes, [0xff, 0xd8, 0xff])) return 'jpeg'
  const gifHeader = readAscii(bytes, 0, 6)
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') return 'gif'
  if (
    readAscii(bytes, 4, 8) === 'ftyp' &&
    HEIC_BRANDS.has(readAscii(bytes, 8, 12))
  )
    return 'heic'

  if (parseSvg(await file.text()) != null) return 'svg'
}

function parseLength(value: string | null): number | undefined {
  if (value == null) return
  const match = /^\s*(\d*\.?\d+)\s*(px)?\s*$/.exec(value)
  if (match == null) return
  const length = Number(match[1])
  return length > 0 ? length : undefined
}

function parseViewBox(
  value: string | null
): { width: number; height: number } | undefined {
  if (value == null) return
  const parts = value.trim().split(/[\s,]+/).map(Number)
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
  const url = URL.createObjectURL(
    new Blob([markup], { type: 'image/svg+xml' })
  )
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
