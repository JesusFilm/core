import { encode } from 'blurhash'
import sharp from 'sharp'

import { baseUrl } from './baseUrl'

export async function generateBlurhash(
  imageId: string
): Promise<string | null> {
  try {
    const imageUrl = baseUrl(imageId)
    const response = await fetch(imageUrl)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const sharpImage = sharp(buffer)
    const metadata = await sharpImage.metadata()

    const width = metadata.width ?? 0
    const height = metadata.height ?? 0

    if (width === 0 || height === 0) {
      return null
    }

    const rawBuffer = await sharpImage.raw().ensureAlpha().toBuffer()
    const blurhash = encode(
      new Uint8ClampedArray(rawBuffer),
      width,
      height,
      4,
      4
    )

    return blurhash
  } catch {
    return null
  }
}
