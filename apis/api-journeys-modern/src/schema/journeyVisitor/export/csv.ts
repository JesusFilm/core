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
 * Sanitize CSV cell while preserving leading whitespace and neutralizing formulas.
 * Also excludes ISO date patterns from being prefixed with apostrophes.
 */
export function sanitizeCSVCell(value: string): string {
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
  if (first === '=' || first === '+' || first === '-' || first === '@') {
    return `${leadingWhitespace}'${rest}`
  }
  // Heuristic: treat phone-like numeric strings as text to preserve leading zeros
  // But exclude ISO date patterns (YYYY-MM-DD) which should remain as-is
  const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(rest)
  if (!isIsoDate) {
    // Strip common formatting characters and check if remaining are digits (optionally prefixed by '+')
    const compact = rest.replace(/[\s().-]/g, '')
    const isNumericLike = /^\+?\d{7,}$/.test(compact)
    if (isNumericLike) {
      return `${leadingWhitespace}'${rest}`
    }
  }
  return str
}
