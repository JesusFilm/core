import { decode } from 'blurhash'

export const blurImage = (
  blurhash: string,
  hexBackground: string
): string | undefined => {
  if (blurhash === '' || typeof document === 'undefined') return undefined

  const pixels = decode(blurhash, 32, 32, 1)

  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', '32px')
  canvas.setAttribute('height', '32px')
  const context = canvas.getContext('2d')

  if (context != null) {
    const imageData = context.createImageData(32, 32)
    imageData.data.set(pixels)
    context.putImageData(imageData, 0, 0)
    context.fillStyle = `${hexBackground}88`
    context.fillRect(0, 0, 32, 32)
    const blurUrl = canvas.toDataURL('image/webp')

    return blurUrl
  }
  return undefined
}
