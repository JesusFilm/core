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

  const resolveExistingLabelToKey = (label: string): string => {
    const normalized = normalizeLabel(label)
    if (normalized === '') return ''

    const fromHeader = headerLabelToKey.get(normalized)
    if (fromHeader != null && fromHeader !== '') return fromHeader

    const fromColumn = columnLabelToKey.get(normalized)
    if (fromColumn != null && fromColumn !== '') return fromColumn

    // If existing cell already contains a key, keep it.
    if (desiredHeaderKeys.includes(normalized)) return normalized

    // Preserve legacy/unknown columns as their own keys (placeholder behavior).
    return normalized
  }

  // Ensure base headers exist in the correct order at start.
  const merged: string[] = []
  for (const baseKey of baseKeys) {
    if (baseKey !== '' && !merged.includes(baseKey)) merged.push(baseKey)
  }

  for (const label of existingHeaderRowLabels) {
    const key = resolveExistingLabelToKey(label ?? '')
    if (key === '' || merged.includes(key)) continue
    merged.push(key)
  }

  for (const key of desiredHeaderKeys) {
    if (key === '' || merged.includes(key)) continue
    merged.push(key)
  }

  const mergedColumns: JourneyExportColumn[] = merged.map((key) => {
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
