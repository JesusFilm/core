/**
 * Localizes and rounds numbers based on locale-specific rules.
 * For numbers >= 10,000:
 * - ja, zh, zh-Hans-CN: uses "万" (e.g., 1万, 1.02万, 10.2万)
 * - ko: uses "만" (e.g., 1만, 1.02만, 10.2만)
 * - others: uses "k" up to 999.9k, then "M" (e.g., 10k, 10.2k, 999.9k, 1M, 999M)
 *
 * Rounding rules:
 * - 10k-999.9k: round to nearest 100, include decimals (e.g., 10.2k, 999.9k)
 * - 1M+: switch to "M" format (divide by 1,000,000)
 *   - 1M-9.9M: include 1 decimal place (e.g., 1.5M, 9.9M)
 *   - 10M-999M: no decimals (e.g., 10M, 100M, 999M)
 * - For "万/만" format:
 *   - 1-9万: 2 decimal places (e.g., 1.02万)
 *   - 10-99万: 1 decimal place (e.g., 81.1万)
 *   - 100万+: no decimals (e.g., 879万)
 */
export function localizeAndRound(value: number, locale: string = 'en'): string {
  // For numbers less than 10,000, return as-is with locale formatting
  if (value < 10000) {
    return value.toLocaleString(locale)
  }

  switch (locale) {
    case 'ja':
    case 'zh':
    case 'zh-Hans-CN': {
      // Use 万 format (divide by 10,000)
      const divisor = 10000
      const divided = value / divisor

      if (divided < 10) {
        // 1万-9万: round to nearest 100, include 2 decimal places
        const rounded = Math.round(value / 100) * 100
        const formatted = (rounded / divisor).toFixed(2)
        // Remove trailing zeros after decimal point
        const cleaned = parseFloat(formatted).toString()
        return `${cleaned}万`
      } else if (divided < 100) {
        // 10万-99万: round to nearest 100, include 1 decimal place
        const rounded = Math.round(value / 100) * 100
        const formatted = (rounded / divisor).toFixed(1)
        // Remove trailing zeros after decimal point
        const cleaned = parseFloat(formatted).toString()
        return `${cleaned}万`
      } else {
        // 100万+: round to nearest whole number, no decimals
        const rounded = Math.round(divided)
        return `${rounded}万`
      }
    }
    case 'ko': {
      // Use 만 format (divide by 10,000)
      const divisor = 10000
      const divided = value / divisor

      if (divided < 10) {
        // 1만-9만: round to nearest 100, include 2 decimal places
        const rounded = Math.round(value / 100) * 100
        const formatted = (rounded / divisor).toFixed(2)
        // Remove trailing zeros after decimal point
        const cleaned = parseFloat(formatted).toString()
        return `${cleaned}만`
      } else if (divided < 100) {
        // 10만-99만: round to nearest 100, include 1 decimal place
        const rounded = Math.round(value / 100) * 100
        const formatted = (rounded / divisor).toFixed(1)
        // Remove trailing zeros after decimal point
        const cleaned = parseFloat(formatted).toString()
        return `${cleaned}만`
      } else {
        // 100만+: round to nearest whole number, no decimals
        const rounded = Math.round(divided)
        return `${rounded}만`
      }
    }
    default: {
      // Use "k" format up to 999.9k, then switch to "M" format
      if (value < 1000000) {
        // 10k-999.9k: use "k" format (divide by 1,000)
        const divisor = 1000
        const rounded = Math.round(value / 100) * 100
        const formatted = (rounded / divisor).toFixed(2)
        // Remove trailing zeros after decimal point
        const cleaned = parseFloat(formatted).toString()
        return `${cleaned}k`
      } else {
        // 1M+: use "M" format (divide by 1,000,000)
        const divisor = 1000000
        const divided = value / divisor

        if (divided < 10) {
          // 1M-9.9M: round to nearest 100k, include 1 decimal place
          const rounded = Math.round(value / 100000) * 100000
          const formatted = (rounded / divisor).toFixed(1)
          // Remove trailing zeros after decimal point
          const cleaned = parseFloat(formatted).toString()
          return `${cleaned}M`
        } else {
          // 10M-999M: round to nearest whole number, no decimals
          const rounded = Math.round(divided)
          return `${rounded}M`
        }
      }
    }
  }
}
