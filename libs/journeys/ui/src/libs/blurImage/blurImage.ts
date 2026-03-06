import { decode } from 'blurhash'

export const blurImage = (
  blurhash: string,
  hexBackground: string
): string | undefined => {
  if (blurhash === '' || typeof document === 'undefined') return undefined

  let pixels: Uint8ClampedArray
  try {
    pixels = decode(blurhash, 32, 32, 1)
  } catch (error) {
    console.warn('Failed to decode blurhash:', error)
    return undefined
  }

  // Validate pixel array size
  const expectedSize = 32 * 32 * 4 // width * height * 4 (RGBA)
  let processedPixels: Uint8ClampedArray

  if (pixels.length < expectedSize) {
    // Pad with background color if array is too small
    processedPixels = new Uint8ClampedArray(expectedSize)
    processedPixels.set(pixels)
    
    // Fill remaining pixels with background color
    const backgroundColor = hexToRgba(hexBackground)
    for (let i = pixels.length; i < expectedSize; i += 4) {
      processedPixels[i] = backgroundColor.r     // R
      processedPixels[i + 1] = backgroundColor.g // G
      processedPixels[i + 2] = backgroundColor.b // B
      processedPixels[i + 3] = backgroundColor.a // A
    }
  } else if (pixels.length > expectedSize) {
    // Crop if array is too large
    processedPixels = pixels.slice(0, expectedSize)
  } else {
    // Array size is correct
    processedPixels = pixels
  }

  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const context = canvas.getContext('2d')

  if (context != null) {
    const imageData = context.createImageData(32, 32)
    imageData.data.set(processedPixels)
    context.putImageData(imageData, 0, 0)
    
    // Apply background overlay
    context.fillStyle = `${hexBackground}88`
    context.fillRect(0, 0, 32, 32)
    
    const blurUrl = canvas.toDataURL('image/webp')
    return blurUrl
  }
  return undefined
}

// Helper function to convert hex color to RGBA
const hexToRgba = (hex: string): { r: number; g: number; b: number; a: number } => {
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  
  return { r, g, b, a: 255 }
}
