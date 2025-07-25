import { encode } from 'blurhash'
import fetch from 'node-fetch'
import sharp from 'sharp'

// Safe default blurhash with 24 characters (4x4 components)
const DEFAULT_BLURHASH = 'L9AJ$Nof00WB~qofM{of00WB~qj['

export async function generateBlurhashAndMetadataFromUrl(
  imageUrl: string
): Promise<{
  blurhash: string
  width: number
  height: number
}> {
  try {
    const response = await fetch(imageUrl)
    const buffer = await response.buffer()
    const sharpImage = sharp(buffer)
    const metadata = await sharpImage.metadata()

    const width = metadata.width ?? 0
    const height = metadata.height ?? 0

    const rawBuffer = await sharpImage.raw().ensureAlpha().toBuffer()
    const blurhash = encode(
      new Uint8ClampedArray(rawBuffer),
      width,
      height,
      4,
      4
    )

    return { blurhash, width, height }
  } catch {
    return { blurhash: DEFAULT_BLURHASH, width: 0, height: 0 }
  }
}
