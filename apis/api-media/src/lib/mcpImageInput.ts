import { createHash } from 'node:crypto'

import { encode } from 'blurhash'
import sharp from 'sharp'

import {
  type MediaFile,
  imageByteLimit,
  mediaFile
} from '@core/yoga/mcp/mediaJobContract'

export const imageHash = (bytes: Uint8Array) =>
  createHash('sha256').update(bytes).digest('hex')

/** Fully decode all frames. Header metadata, extensions and declared MIME alone
 * cannot establish a valid image. Ambiguous formats are not advertised.
 */
export async function validateImageInput(bytes: Buffer, input: MediaFile) {
  const file = mediaFile.parse(input)
  if (
    bytes.length > imageByteLimit ||
    bytes.length !== file.size ||
    imageHash(bytes) !== file.sha256
  )
    throw new Error('VALIDATION_FAILED')
  const image = sharp(bytes, {
    animated: true,
    limitInputPixels: 100_000_000,
    failOn: 'warning'
  })
  const info = await image.metadata()
  const format = info.format
  const expected = {
    png: ['image/png', /\.png$/i],
    jpeg: ['image/jpeg', /\.jpe?g$/i],
    webp: ['image/webp', /\.webp$/i],
    gif: ['image/gif', /\.gif$/i]
  } as const
  if (!format || !(format in expected)) throw new Error('VALIDATION_FAILED')
  const [mime, extension] = expected[format as keyof typeof expected]
  const height = info.pageHeight ?? info.height
  const pages = info.pages ?? 1
  if (
    mime !== file.mime ||
    !extension.test(file.name) ||
    !info.width ||
    !height ||
    (format !== 'webp' && (info.width > 12000 || height > 12000)) ||
    info.width * height * pages > 100_000_000
  )
    throw new Error('VALIDATION_FAILED')
  // stats forces decoding, including frames not used in the thumbnail.
  await image.stats()
  const { data, info: thumb } = await sharp(bytes)
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  return {
    width: info.width,
    height,
    blurhash: encode(
      new Uint8ClampedArray(data),
      thumb.width,
      thumb.height,
      4,
      4
    )
  }
}
