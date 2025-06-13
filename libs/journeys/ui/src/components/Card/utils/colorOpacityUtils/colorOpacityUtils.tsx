export function isValidHex(hex: string): boolean {
  const hexColorRegex = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/
  return hexColorRegex.test(hex)
}

export function getOpacityFromHex(hex: string): number {
  if (!isValidHex(hex)) {
    return 100 // Default opacity for invalid HEX
  }

  // If it's a 6-digit hex (#RRGGBB), it has no alpha channel, so it's 100% opaque
  if (hex.length === 7) {
    return 100
  }

  // If it's an 8-digit hex (#RRGGBBAA), extract the alpha channel
  const alphaHex = hex.slice(-2)

  // Convert HEX to decimal (0-255)
  const alphaDecimal = parseInt(alphaHex, 16)

  // Convert to percentage (0-100) and round to nearest integer
  const opacityPercentage = Math.round((alphaDecimal / 255) * 100)

  return opacityPercentage
}

export function stripAlphaFromHex(hex: string): string {
  if (!isValidHex(hex)) {
    return hex // Return as-is if not 8-digit
  }

  // Remove the last 2 characters (alpha channel)
  return hex.slice(0, 7) // "#RRGGBB"
}

export function addAlphaToHex(hex: string, opacityPercentage: number): string {
  // Strip any existing alpha channel first
  const baseHex = stripAlphaFromHex(hex)

  // Convert percentage to decimal (0-255)
  const alphaDecimal = Math.round((opacityPercentage / 100) * 255)

  // Convert decimal to HEX (padded to 2 characters)
  const alphaHex = alphaDecimal.toString(16).padStart(2, '0').toUpperCase()

  return `${baseHex}${alphaHex}`
}
