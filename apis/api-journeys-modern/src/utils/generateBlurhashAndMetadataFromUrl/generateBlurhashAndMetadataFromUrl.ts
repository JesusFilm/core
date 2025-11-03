import { encode } from 'blurhash'
import fetch from 'node-fetch'
import sharp from 'sharp'

interface ImageMetadata {
  blurhash: string
  width: number
  height: number
}

export async function generateBlurhashAndMetadataFromUrl(
  imageUrl: string
): Promise<ImageMetadata> {
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
  } catch (error) {
    return { blurhash: '', width: 0, height: 0 }
  }
}
