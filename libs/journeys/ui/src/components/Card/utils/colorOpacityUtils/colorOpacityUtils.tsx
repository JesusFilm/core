export function isValidHex(hex: string): boolean {
  const hexColorRegex = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/
  return hexColorRegex.test(hex)
}

export function getOpacityFromHex(hex: string): number | undefined {
  if (!isValidHex(hex)) return

  if (hex.length === 7) {
    return 30
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

/**
 * Adds or replaces the alpha channel of a hex color with a specified opacity percentage
 *
 * @param hex - A valid hex color string in the format #RRGGBB or #RRGGBBAA
 * @param opacityPercentage - The desired opacity percentage (0-100)
 * @returns A hex color string with the specified opacity, in the format #RRGGBBAA
 * @example
 * // Returns "#FFFFFF80" (50% opacity)
 * addAlphaToHex("#FFFFFF", 50)
 *
 * // Returns "#FFFFFF33" (20% opacity)
 * addAlphaToHex("#FFFFFFFF", 20)
 */
export function addAlphaToHex(hex: string, opacityPercentage: number): string {
  const baseHex = stripAlphaFromHex(hex)

  const clampedOpacityPercentage = Math.min(100, Math.max(0, opacityPercentage))
  const alphaDecimal = Math.round((clampedOpacityPercentage / 100) * 255)

  // Convert decimal alpha (0-255) to 2-digit hex (00-FF)
  const alphaHex = alphaDecimal.toString(16).padStart(2, '0').toUpperCase()

  return `${baseHex}${alphaHex}`
}

/**
 * Reduces the opacity of a hex color by subtracting a specified percentage from its current opacity
 *
 * @param hex - A valid hex color string in the format #RRGGBB or #RRGGBBAA
 * @param opacityPercentage - The percentage (0-100) to subtract from the current opacity
 * @returns A hex color string with the reduced opacity, in the format #RRGGBBAA
 * @example
 * // Returns "#FFFFFF80" (50% opacity)
 * reduceHexOpacity("#FFFFFFFF", 50)
 *
 * // Returns "#FFFFFF33" (20% opacity)
 * reduceHexOpacity("#FFFFFF80", 30)
 */
export function reduceHexOpacity(
  hex: string,
  opacityPercentage: number
): string {
  if (!isValidHex(hex)) return hex

  const baseHex = stripAlphaFromHex(hex)

  // Get current alpha value or default to 100% if no alpha channel
  const currentOpacity = getOpacityFromHex(hex) ?? 100

  // Directly subtract the percentage from the current opacity
  // Ensure it doesn't go below 0
  const newOpacityPercentage = Math.max(0, currentOpacity - opacityPercentage)

  // Convert to decimal alpha (0-255)
  const alphaDecimal = Math.round((newOpacityPercentage / 100) * 255)

  // Convert decimal alpha to 2-digit hex (00-FF)
  const alphaHex = alphaDecimal.toString(16).padStart(2, '0').toUpperCase()

  return `${baseHex}${alphaHex}`
}

export function applyDefaultAlpha(hex: string): string {
  return hex.length === 7 ? `${hex}4D` : hex
}
