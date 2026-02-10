import { sanitizeCSVCell, sanitizeGoogleSheetsCell } from './csv'
import {
  type BaseColumnLabelResolver,
  type JourneyExportColumn,
  buildHeaderRows
} from './headings'

export interface MergeGoogleSheetsHeaderParams {
  baseKeys: string[]
  columns: JourneyExportColumn[]
  desiredHeaderKeys: string[]
  existingHeaderRowLabels: string[]
  userTimezone: string
  getCardHeading: (blockId: string | null | undefined) => string
  baseColumnLabelResolver?: BaseColumnLabelResolver
}

export interface MergeGoogleSheetsHeaderResult {
  finalHeaderKeys: string[]
  finalHeaderRowLabels: string[]
  writeWidth: number
}

function normalizeLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function addLabelMapping(
  map: Map<string, string>,
  label: string,
  key: string
): void {
  const normalized = normalizeLabel(label)
  if (normalized === '') return

  const existing = map.get(normalized)
  if (existing != null && existing !== key) {
    // Ambiguous label -> do not map to avoid incorrect alignment.
    map.set(normalized, '')
    return
  }
  map.set(normalized, key)
}

/**
 * Merge an existing Google Sheets header row (labels) with the desired export columns (keys),
 * producing a final ordered list of header keys and the corresponding header labels to write.
 *
 * IMPORTANT: This function strictly preserves the existing header order.
 * - Existing columns are NEVER moved or rearranged
 * - New columns are ONLY appended at the end
 * - Column order is determined by exportOrder on blocks when creating new sheets
 * - Blocks with exportOrder use position-based matching (not label matching) to avoid
 *   ambiguity when multiple blocks have the same display label (e.g., multiple "Poll" columns)
 *
 * This is shared by the initial export and the live sync to prevent header drift.
 */
export function mergeGoogleSheetsHeader({
  baseKeys,
  columns,
  desiredHeaderKeys,
  existingHeaderRowLabels,
  userTimezone,
  getCardHeading,
  baseColumnLabelResolver
}: MergeGoogleSheetsHeaderParams): MergeGoogleSheetsHeaderResult {
  const { headerRow: desiredHeaderRowLabels } = buildHeaderRows({
    columns,
    userTimezone,
    getCardHeading,
    baseColumnLabelResolver
  })

  // Build a map from exportOrder position -> column key for blocks with exportOrder.
  // This allows us to match columns by position rather than by (potentially ambiguous) label.
  const exportOrderToKey = new Map<number, string>()
  columns.forEach((column) => {
    if (column.exportOrder != null && column.key !== '') {
      // exportOrder is 1-indexed relative to block columns (after base columns)
      // So exportOrder 1 = position baseKeys.length (e.g., position 2 if base keys are visitorId, date)
      const position = baseKeys.length + column.exportOrder - 1
      exportOrderToKey.set(position, column.key)
    }
  })

  // Map canonical header labels (and sanitized variants) -> column key.
  const headerLabelToKey = new Map<string, string>()
  desiredHeaderRowLabels.forEach((label, index) => {
    const key = desiredHeaderKeys[index] ?? ''
    if (key === '' || label == null) return

    addLabelMapping(headerLabelToKey, label, key)
    addLabelMapping(headerLabelToKey, sanitizeCSVCell(label), key)
    addLabelMapping(headerLabelToKey, sanitizeGoogleSheetsCell(label), key)
  })

  // Map raw column labels -> key (helps reconcile legacy sheets where Multiselect used to be just "Multi")
  // Only map when unique.
  const columnLabelToKey = new Map<string, string>()
  columns.forEach((column) => {
    if (column.key === '' || column.label == null) return
    addLabelMapping(columnLabelToKey, column.label, column.key)
    addLabelMapping(columnLabelToKey, sanitizeCSVCell(column.label), column.key)
    addLabelMapping(
      columnLabelToKey,
      sanitizeGoogleSheetsCell(column.label),
      column.key
    )
  })

  const resolveExistingLabelToKey = (
    label: string,
    columnIndex: number
  ): string => {
    const normalized = normalizeLabel(label)
    if (normalized === '') return ''

    // First, check if this position has a block with exportOrder that maps here.
    // This takes priority over label matching to handle ambiguous labels (e.g., multiple "Poll" columns).
    const keyFromExportOrder = exportOrderToKey.get(columnIndex)
    if (keyFromExportOrder != null) {
      return keyFromExportOrder
    }

    const fromHeader = headerLabelToKey.get(normalized)
    if (fromHeader != null && fromHeader !== '') return fromHeader

    const fromColumn = columnLabelToKey.get(normalized)
    if (fromColumn != null && fromColumn !== '') return fromColumn

    // If existing cell already contains a key, keep it.
    if (desiredHeaderKeys.includes(normalized)) return normalized

    // Preserve legacy/unknown columns as their own keys (placeholder behavior).
    return normalized
  }

  // Check if this is a new sheet (no existing headers)
  const hasExistingHeaders = existingHeaderRowLabels.some(
    (label) => normalizeLabel(label ?? '') !== ''
  )

  let merged: string[]

  if (!hasExistingHeaders) {
    // New sheet: use base keys first, then desired keys in their exportOrder-based order
    merged = []
    for (const baseKey of baseKeys) {
      if (baseKey !== '' && !merged.includes(baseKey)) merged.push(baseKey)
    }
    for (const key of desiredHeaderKeys) {
      if (key === '' || merged.includes(key)) continue
      merged.push(key)
    }
  } else {
    // Existing sheet: STRICTLY preserve existing column order, only append new columns
    merged = []
    const existingKeys = new Set<string>()

    // First, process existing headers in their EXACT order
    for (let i = 0; i < existingHeaderRowLabels.length; i++) {
      const label = existingHeaderRowLabels[i]
      const key = resolveExistingLabelToKey(label ?? '', i)
      if (key === '') {
        // Preserve empty columns as placeholders to maintain positions
        merged.push('')
      } else if (!existingKeys.has(key)) {
        merged.push(key)
        existingKeys.add(key)
      } else {
        // Duplicate key - preserve position with empty placeholder
        merged.push('')
      }
    }

    // Remove trailing empty placeholders for cleaner output
    while (merged.length > 0 && merged[merged.length - 1] === '') {
      merged.pop()
    }

    // Append new keys that don't exist in the sheet yet
    for (const key of desiredHeaderKeys) {
      if (key === '' || existingKeys.has(key)) continue
      merged.push(key)
    }
  }

  const mergedColumns: JourneyExportColumn[] = merged.map((key) => {
    if (key === '') return { key: '', label: '', blockId: null, typename: '' }
    const existingCol = columns.find((c) => c.key === key)
    if (existingCol != null) return existingCol
    return { key, label: key, blockId: null, typename: '' }
  })

  const { headerRow: mergedHeaderRowLabels } = buildHeaderRows({
    columns: mergedColumns,
    userTimezone,
    getCardHeading,
    baseColumnLabelResolver
  })

  const existingWidth = existingHeaderRowLabels.length
  const writeWidth = Math.max(existingWidth, mergedHeaderRowLabels.length)
  const paddedHeaderRowLabels =
    writeWidth === mergedHeaderRowLabels.length
      ? mergedHeaderRowLabels
      : [
          ...mergedHeaderRowLabels,
          ...Array.from({
            length: writeWidth - mergedHeaderRowLabels.length
          }).map(() => '')
        ]

  return {
    finalHeaderKeys: merged,
    finalHeaderRowLabels: paddedHeaderRowLabels,
    writeWidth
  }
}
