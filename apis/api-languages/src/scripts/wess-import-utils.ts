/**
 * Shared helpers for the WESS QueryRunner import scripts
 * (`wess-languages-import`, `wess-countries-import`,
 * `wess-country-languages-import`). Only the pieces that are genuinely identical
 * across all three scripts live here; script-specific constants, id-key lists,
 * loggers, normalizers, fetch/upsert logic and CLI bootstrap stay in each script.
 */

export type WessRawRow = Record<string, unknown>

export const WESS_ARRAY_WRAPPER_KEYS = [
  'data',
  'rows',
  'Data',
  'Rows',
  'result',
  'Result',
  'value',
  'Value',
  'items',
  'Items',
  'values',
  'Values',
  'GetDataResult',
  'getDataResult'
] as const

export function readRequiredEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value.trim() === '') {
    throw new Error(`${name} environment variable is not set`)
  }
  return value
}

export function readStringField(
  row: WessRawRow,
  keys: string[],
  options: { lowercase?: boolean; uppercase?: boolean } = {}
): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string') {
      const normalized = value.trim()
      if (normalized !== '') {
        if (options.lowercase === true) return normalized.toLowerCase()
        if (options.uppercase === true) return normalized.toUpperCase()
        return normalized
      }
    }
    if (typeof value === 'number') {
      return String(value)
    }
  }
  return null
}

export function readNumberField(
  row: WessRawRow,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const normalized = value.trim()
      if (normalized === '') {
        continue
      }
      const parsed = Number(normalized)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }
  return null
}

export function readBooleanField(
  row: WessRawRow,
  keys: string[]
): boolean | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'number') {
      return value !== 0
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
        return true
      }
      if (normalized === 'false' || normalized === '0' || normalized === 'no') {
        return false
      }
    }
  }
  return null
}

export function isTabularPayload(payload: unknown[]): boolean {
  if (payload.length === 0) {
    return false
  }
  return payload.every((row) => Array.isArray(row))
}

export function tabularRowsToObjects(matrix: unknown[][]): WessRawRow[] {
  if (matrix.length < 2) {
    return []
  }

  const headerCells = matrix[0]
  const headers = headerCells.map((cell) => String(cell).trim())
  const objectRows: WessRawRow[] = []

  for (let r = 1; r < matrix.length; r++) {
    const cells = matrix[r]
    const record: WessRawRow = {}
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c]
      if (key === '') {
        continue
      }
      record[key] = cells[c]
    }
    objectRows.push(record)
  }

  return objectRows
}

/**
 * Decides whether a bare WESS object (not wrapped in `{ data: … }` and not a
 * tabular grid) represents a single valid row. Each script has different id
 * requirements, so callers pass their own predicate.
 */
export type WessSingleRowPredicate = (row: WessRawRow) => boolean

/**
 * WESS GetData often returns JSON wrapped in `{ data: … }` or a tabular
 * `[ [ "col", … ], [ … ] ]` grid. This flattens those shapes into an array of
 * row objects. The `isSingleRow` predicate decides whether a bare object should
 * be treated as one row (its rules differ per script).
 */
export function extractWessRowArray(
  payload: unknown,
  isSingleRow: WessSingleRowPredicate
): WessRawRow[] {
  if (payload == null) {
    return []
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim()
    if (trimmed === '') {
      return []
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(trimmed) as unknown
    } catch {
      throw new Error(
        'Unexpected WESS response: payload string is not valid JSON'
      )
    }
    return extractWessRowArray(parsed, isSingleRow)
  }

  if (Array.isArray(payload)) {
    if (isTabularPayload(payload)) {
      return tabularRowsToObjects(payload as unknown[][])
    }

    return payload.filter(
      (row): row is WessRawRow =>
        row != null && typeof row === 'object' && !Array.isArray(row)
    )
  }

  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    for (const key of WESS_ARRAY_WRAPPER_KEYS) {
      if (!(key in record)) {
        continue
      }
      const inner = record[key]
      if (inner == null) {
        continue
      }
      return extractWessRowArray(inner, isSingleRow)
    }

    if (isSingleRow(record as WessRawRow)) {
      return [record as WessRawRow]
    }

    const keys = Object.keys(record).slice(0, 25).join(', ')
    throw new Error(
      `Unexpected WESS response: unsupported object shape (sample keys: ${keys || '(none)'})`
    )
  }

  throw new Error(
    `Unexpected WESS response: expected array or object, got ${typeof payload}`
  )
}

export function parseWessResponseBody(bodyText: string): unknown {
  const trimmed = bodyText.trim()
  if (trimmed === '') {
    return null
  }
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    throw new Error(
      `WESS response is not valid JSON (first 400 chars): ${bodyText.slice(0, 400)}`
    )
  }
}
