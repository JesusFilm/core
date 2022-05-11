import { decode } from 'blurhash'

const greatestCommonDivisor = (a: number, b: number): number =>
  b === 0 ? a : greatestCommonDivisor(b, a % b)

export const blurImage = (
  imageWidth: number,
  imageHeight: number,
  blurhash: string,
  hexBackground: string
): string | undefined => {
  if (blurhash === '') return undefined

  const divisor = greatestCommonDivisor(imageWidth, imageHeight)
  const width = imageWidth / divisor
  const height = imageHeight / divisor
  const pixels = decode(blurhash, width, height, 1)

  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', `${width}px`)
  canvas.setAttribute('height', `${height}px`)
  const context = canvas.getContext('2d')

  if (context != null) {
    const imageData = context.createImageData(width, height)
    imageData.data.set(pixels)
    context.putImageData(imageData, 0, 0)
    context.fillStyle = `${hexBackground}88`
    context.fillRect(0, 0, width, height)
    const blurUrl = canvas.toDataURL('image/webp')

    return blurUrl
  }
  return undefined
}
