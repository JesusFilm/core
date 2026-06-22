import { stringify } from 'csv-stringify'

export interface CsvColumn {
  key: string
}

export function createCsvStringifier(columns: CsvColumn[]) {
  const stringifier = stringify({
    header: false,
    quoted: true,
    quote: '"',
    escape: '"',
    quoted_empty: true,
    columns,
    cast: {
      string: (value: any) => String(value ?? '')
    }
  })

  let csvContent = ''
  stringifier.on('data', (chunk) => {
    csvContent += chunk
  })

  const onEndPromise = new Promise<void>((resolve) => {
    stringifier.on('end', () => resolve())
  })

  return {
    stringifier,
    onEndPromise,
    getContent: () => csvContent
  }
}

/**
 * Sanitize cell for formula injection while preserving leading whitespace.
 * Returns the sanitized string and whether an apostrophe was added for phone-like numbers.
 */
function sanitizeCellInternal(
  value: string,
  prefixPhoneNumbers: boolean
): string {
  if (value == null) return ''
  const str = typeof value === 'string' ? value : String(value)

  // Preserve leading whitespace; inspect first non-whitespace character
  const leadingMatch = str.match(/^\s*/)
  const leadingWhitespace = leadingMatch != null ? leadingMatch[0] : ''
  const rest = str.slice(leadingWhitespace.length)

  if (rest.length === 0) return str
  // If already explicitly text (leading apostrophe), leave unchanged
  if (rest[0] === "'") return str
  const first = rest[0]
  // Always escape formula injection characters
  if (first === '=' || first === '@') {
    return `${leadingWhitespace}'${rest}`
  }
  // For + and - at the start, only escape if it looks like a formula (not a phone number with +)
  if (first === '+' || first === '-') {
    // Check if it's a phone-like number (digits after the + or -)
    const afterSign = rest.slice(1).replace(/[\s().-]/g, '')
    const isPhoneLike = /^\d{6,}$/.test(afterSign)
    if (!isPhoneLike) {
      // Not a phone number, escape as potential formula
      return `${leadingWhitespace}'${rest}`
    }
  }

  // Heuristic: treat phone-like numeric strings as text to preserve leading zeros
  // But exclude ISO date patterns (YYYY-MM-DD) which should remain as-is
  if (prefixPhoneNumbers) {
    const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(rest)
    if (!isIsoDate) {
      // Strip common formatting characters and check if remaining are digits (optionally prefixed by '+')
      const compact = rest.replace(/[\s().-]/g, '')
      const isNumericLike = /^\+?\d{7,}$/.test(compact)
      if (isNumericLike) {
        return `${leadingWhitespace}'${rest}`
      }
    }
  }
  return str
}

/**
 * Sanitize CSV cell while preserving leading whitespace and neutralizing formulas.
 * Also excludes ISO date patterns from being prefixed with apostrophes.
 * Adds apostrophe prefix to phone-like numbers to preserve formatting in CSV imports.
 */
export function sanitizeCSVCell(value: string): string {
  return sanitizeCellInternal(value, true)
}

/**
 * Sanitize cell for Google Sheets API.
 * Handles formula injection protection but does NOT add apostrophe prefix for phone numbers.
 * When using Google Sheets API with valueInputOption=RAW, strings are stored literally
 * and don't need the apostrophe trick that CSV imports use.
 */
export function sanitizeGoogleSheetsCell(value: string): string {
  return sanitizeCellInternal(value, false)
}
