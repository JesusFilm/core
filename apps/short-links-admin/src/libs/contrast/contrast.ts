export const MIN_QR_CONTRAST_RATIO = 3

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

export function isHexColor(value: string): boolean {
  return HEX_COLOR.test(value.trim())
}

export function normalizeHexColor(value: string): string | undefined {
  const match = HEX_COLOR.exec(value.trim())
  if (match == null) return undefined

  const hex = match[1]
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => char + char)
          .join('')
      : hex

  return `#${full.toLowerCase()}`
}

function channelLuminance(channel: number): number {
  const srgb = channel / 255
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number | undefined {
  const normalized = normalizeHexColor(hex)
  if (normalized == null) return undefined

  const red = parseInt(normalized.slice(1, 3), 16)
  const green = parseInt(normalized.slice(3, 5), 16)
  const blue = parseInt(normalized.slice(5, 7), 16)

  return (
    0.2126 * channelLuminance(red) +
    0.7152 * channelLuminance(green) +
    0.0722 * channelLuminance(blue)
  )
}

/**
 * WCAG contrast ratio between two hex colours, from 1 (identical) to 21.
 * Returns undefined when either colour is not a valid hex colour.
 */
export function contrastRatio(
  foreground: string,
  background: string
): number | undefined {
  const first = relativeLuminance(foreground)
  const second = relativeLuminance(background)
  if (first == null || second == null) return undefined

  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)

  return (lighter + 0.05) / (darker + 0.05)
}

export function hasLowQrContrast(dark: string, light: string): boolean {
  const ratio = contrastRatio(dark, light)
  return ratio != null && ratio < MIN_QR_CONTRAST_RATIO
}
