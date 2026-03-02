import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const INPUT_CSV_PATH = 'apis/api-media/src/scripts/retry-mux-r2.csv'
const OUTPUT_MD_PATH = 'apis/api-media/src/scripts/retry-mux-summary.md'

interface CsvRow {
  r2AssetId: string
  videoId: string
  languageId: string
  edition: string
  muxProcessed: boolean
  muxStatus: string
  muxErrorMessage: string
  lastResult: string
  lastError: string
}

function parseStringArg(args: string[], key: string): string | undefined {
  const arg = args.find((value) => value.startsWith(`${key}=`))
  if (!arg) return undefined
  const value = arg.slice(key.length + 1).trim()
  return value.length > 0 ? value : undefined
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      const nextChar = line[i + 1]
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }
    current += char
  }

  values.push(current)
  return values
}

function parseCsv(contents: string): CsvRow[] {
  const lines = contents.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length <= 1) return []

  const header = parseCsvLine(lines[0])
  const columnIndex = new Map<string, number>()
  for (let i = 0; i < header.length; i++) {
    columnIndex.set(header[i], i)
  }
  const getValue = (row: string[], key: string): string =>
    row[columnIndex.get(key) ?? -1] ?? ''

  return lines.slice(1).map((line) => {
    const row = parseCsvLine(line)
    return {
      r2AssetId: getValue(row, 'r2AssetId'),
      videoId: getValue(row, 'videoId'),
      languageId: getValue(row, 'languageId'),
      edition: getValue(row, 'edition'),
      muxProcessed: getValue(row, 'muxProcessed') === 'true',
      muxStatus: getValue(row, 'muxStatus'),
      muxErrorMessage: getValue(row, 'muxErrorMessage'),
      lastResult: getValue(row, 'lastResult'),
      lastError: getValue(row, 'lastError')
    }
  })
}

function summarize(rows: CsvRow[]) {
  let passed = 0
  let failed = 0
  let skipped = 0
  let pending = 0

  const failureByResult = new Map<string, number>()
  const failureByReason = new Map<string, number>()

  for (const row of rows) {
    const result = row.lastResult || '(none)'
    const isPassed = row.muxProcessed || result === 'processed_ready' || result === 'already_ready'
    const isSkipped = result.startsWith('skipped_')
    const isFailed =
      result === 'error' ||
      result === 'errored' ||
      result === 'missing_mux_video' ||
      result === 'missing_mux_asset' ||
      result === 'ready_missing_playback_id'

    if (isPassed) {
      passed++
      continue
    }
    if (isSkipped) {
      skipped++
      continue
    }
    if (isFailed) {
      failed++
      failureByResult.set(result, (failureByResult.get(result) ?? 0) + 1)

      const rawReason = row.lastError || row.muxErrorMessage || row.muxStatus || result
      const reason = rawReason.slice(0, 160)
      failureByReason.set(reason, (failureByReason.get(reason) ?? 0) + 1)
      continue
    }

    pending++
  }

  return { passed, failed, skipped, pending, failureByResult, failureByReason }
}

function toSortedEntries(map: Map<string, number>, limit = 20): Array<[string, number]> {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const inputPath = resolve(parseStringArg(args, '--input') ?? INPUT_CSV_PATH)
  const outputPath = resolve(parseStringArg(args, '--output') ?? OUTPUT_MD_PATH)

  const rows = parseCsv(await readFile(inputPath, 'utf8'))
  const summary = summarize(rows)

  const total = rows.length
  const passPct = total > 0 ? ((summary.passed / total) * 100).toFixed(1) : '0.0'
  const failPct = total > 0 ? ((summary.failed / total) * 100).toFixed(1) : '0.0'

  const byResult = toSortedEntries(summary.failureByResult, 20)
  const byReason = toSortedEntries(summary.failureByReason, 20)

  const report = [
    '# Mux Retry Summary',
    '',
    `- Input: \`${inputPath}\``,
    `- Total rows: ${total}`,
    `- Passed: ${summary.passed} (${passPct}%)`,
    `- Failed: ${summary.failed} (${failPct}%)`,
    `- Skipped: ${summary.skipped}`,
    `- Pending: ${summary.pending}`,
    '',
    '## Failures by `lastResult`',
    ...byResult.map(([key, count]) => `- ${key}: ${count}`),
    '',
    '## Top Failure Reasons',
    ...byReason.map(([key, count]) => `- ${count}x ${key}`)
  ].join('\n')

  await writeFile(outputPath, report, 'utf8')

  console.log('=== Mux Retry Summary ===')
  console.log(`Input: ${inputPath}`)
  console.log(`Output: ${outputPath}`)
  console.log(`Total: ${total}`)
  console.log(`Passed: ${summary.passed}`)
  console.log(`Failed: ${summary.failed}`)
  console.log(`Skipped: ${summary.skipped}`)
  console.log(`Pending: ${summary.pending}`)
}

if (require.main === module) {
  void main().catch((error) => {
    console.error('Summary failed:', error)
    process.exitCode = 1
  })
}

