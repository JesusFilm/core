/**
 * Localizes and rounds numbers based on locale-specific rules.
 * For numbers >= 10,000:
 * - ja, zh, zh-Hans-CN: uses "万" (e.g., 1万, 1.02万, 10.2万)
 * - ko: uses "만" (e.g., 1만, 1.02만, 10.2만)
 * - others: uses "k" up to 999.9k, then "M" (e.g., 10k, 10.2k, 999.9k, 1M, 999M)
 *
 * Rounding rules:
 * - 10k-99.9k: round to nearest 100, include decimals (max 3 digits, e.g., 12.3k)
 * - 100k-999k: round to nearest 1000, no decimals (max 3 digits, e.g., 152k)
 * - 1M+: switch to "M" format (divide by 1,000,000)
 *   - 1M-9.9M: include 1 decimal place (e.g., 1.5M, 9.9M)
 *   - 10M-999M: no decimals (e.g., 10M, 100M, 999M)
 * - For "万/만" format:
 *   - 1-9万: 2 decimal places (e.g., 1.02万)
 *   - 10-99万: 1 decimal place (e.g., 81.1万)
 *   - 100万+: no decimals (e.g., 879万)
 */

const THOUSAND = 1000
const TEN_THOUSAND = 10000
const HUNDRED_THOUSAND = 100000
const MILLION = 1000000
const MIN_FORMATTED_VALUE = 10000

function formatWithDecimals(
  value: number,
  divisor: number,
  decimalPlaces: number,
  roundingPrecision: number = 100,
  maxThreshold?: number
): string {
  const rounded = Math.round(value / roundingPrecision) * roundingPrecision
  const formatted = (rounded / divisor).toFixed(decimalPlaces)
  const numValue = parseFloat(formatted)

  // If the result rounds up to or above the max threshold, use one more decimal place
  if (maxThreshold != null && numValue >= maxThreshold) {
    const formattedWithMoreDecimals = (value / divisor).toFixed(
      decimalPlaces + 1
    )
    const numValueWithMoreDecimals = parseFloat(formattedWithMoreDecimals)
    if (numValueWithMoreDecimals < maxThreshold) {
      return numValueWithMoreDecimals.toString()
    }
  }

  return numValue.toString()
}

function formatWan(value: number, suffix: '万' | '만'): string {
  const divided = value / TEN_THOUSAND

  if (divided < 10) {
    const formatted = formatWithDecimals(value, TEN_THOUSAND, 2)
    return `${formatted}${suffix}`
  }

  if (divided < 100) {
    const formatted = formatWithDecimals(value, TEN_THOUSAND, 1, 1000, 100)
    return `${formatted}${suffix}`
  }

  const rounded = Math.round(divided)
  return `${rounded}${suffix}`
}

function formatKilo(value: number): string {
  const divided = value / THOUSAND

  if (divided < 100) {
    const formatted = formatWithDecimals(value, THOUSAND, 1)
    return `${formatted}k`
  }

  const truncated = Math.floor(divided)
  return `${truncated}k`
}

function formatMillion(value: number): string {
  const divided = value / MILLION

  if (divided < 10) {
    const rounded = Math.round(value / HUNDRED_THOUSAND) * HUNDRED_THOUSAND
    const formatted = (rounded / MILLION).toFixed(1)
    const cleaned = parseFloat(formatted).toString()
    return `${cleaned}M`
  }

  const rounded = Math.round(divided)
  return `${rounded}M`
}

export function localizeAndRound(
  value?: number,
  locale: string = 'en'
): string | undefined {
  if (value == null) return undefined
  // For numbers less than 10,000, return as-is with locale formatting
  if (value < MIN_FORMATTED_VALUE) {
    return value.toLocaleString(locale)
  }

  switch (locale) {
    case 'ja':
    case 'zh':
    case 'zh-Hans-CN':
      return formatWan(value, '万')

    case 'ko':
      return formatWan(value, '만')

    default: {
      if (value < MILLION) {
        return formatKilo(value)
      }
      return formatMillion(value)
    }
  }
}
