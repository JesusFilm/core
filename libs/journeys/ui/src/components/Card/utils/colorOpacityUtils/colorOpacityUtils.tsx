export function isValidHex(hex: string): boolean {
  const hexColorRegex = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/
  return hexColorRegex.test(hex)
}

export function getOpacityFromHex(hex: string): number | undefined {
  if (!isValidHex(hex)) return

  if (hex.length === 7) {
    return
  }

  const alphaHex = hex.slice(-2)
  const alphaDecimal = parseInt(alphaHex, 16)
  const opacityPercentage = Math.round((alphaDecimal / 255) * 100)
  return opacityPercentage
}

export function stripAlphaFromHex(hex: string): string {
  if (!isValidHex(hex)) return hex

  return hex.slice(0, 7) // "#RRGGBB"
}

export function addAlphaToHex(hex: string, opacityPercentage: number): string {
  const baseHex = stripAlphaFromHex(hex)

  const clampedOpacityPercentage = Math.min(100, Math.max(0, opacityPercentage))
  const alphaDecimal = Math.round((clampedOpacityPercentage / 100) * 255)

  // Convert decimal alpha (0-255) to 2-digit hex (00-FF)
  const alphaHex = alphaDecimal.toString(16).padStart(2, '0').toUpperCase()

  return `${baseHex}${alphaHex}`
}
