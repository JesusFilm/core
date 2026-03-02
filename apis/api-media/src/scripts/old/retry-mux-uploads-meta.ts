import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import {
  DEFAULT_EXPORT_CSV_PATH,
  processCsvIssues,
  retryMuxUploads
} from '../retry-mux-uploads'

const DEFAULT_STATE_PATH =
  'apis/api-media/src/scripts/retry-mux-uploads-state.json'

interface ResumeState {
  cursorCreatedAt?: string
  cursorId?: string
  exportCsvPath?: string
  lastRunAt?: string
  limit?: number
  scanPageSize?: number
}

function parseNumberArg(
  args: string[],
  key: string,
  fallback?: number
): number | undefined {
  const arg = args.find((value) => value.startsWith(`${key}=`))
  if (!arg) return fallback
  const parsed = Number.parseInt(arg.split('=')[1], 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

function parseStringArg(args: string[], key: string): string | undefined {
  const arg = args.find((value) => value.startsWith(`${key}=`))
  if (!arg) return undefined
  const value = arg.split('=')[1]
  return value.length > 0 ? value : undefined
}

async function loadState(statePath: string): Promise<ResumeState | null> {
  try {
    const resolvedPath = resolve(statePath)
    const contents = await readFile(resolvedPath, 'utf8')
    return JSON.parse(contents) as ResumeState
  } catch {
    return null
  }
}

async function writeState(
  statePath: string,
  state: ResumeState
): Promise<void> {
  const resolvedPath = resolve(statePath)
  await writeFile(resolvedPath, JSON.stringify(state, null, 2), 'utf8')
  console.log(`Resume state written to: ${resolvedPath}`)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const noLimit = args.includes('--no-limit')
  const limit = noLimit ? undefined : parseNumberArg(args, '--limit', 1000)
  const scanPageSize = parseNumberArg(args, '--scan-page-size', 1000)
  const statePath = parseStringArg(args, '--state-file') ?? DEFAULT_STATE_PATH
  const state = await loadState(statePath)
  const exportCsvPath =
    parseStringArg(args, '--export-csv') ??
    state?.exportCsvPath ??
    DEFAULT_EXPORT_CSV_PATH
  const dryRun = args.includes('--dry-run')
  const exportOnly = args.includes('--export-only')
  const muxUserId = parseStringArg(args, '--mux-user-id') ?? 'system'
  const cursorCreatedAtValue =
    parseStringArg(args, '--cursor-created-at') ?? state?.cursorCreatedAt
  const cursorId = parseStringArg(args, '--cursor-id') ?? state?.cursorId
  const cursorCreatedAt = cursorCreatedAtValue
    ? new Date(cursorCreatedAtValue)
    : undefined

  if (
    (cursorCreatedAt && !cursorId) ||
    (!cursorCreatedAt && cursorId) ||
    (cursorCreatedAt && Number.isNaN(cursorCreatedAt.getTime()))
  ) {
    throw new Error(
      'Both --cursor-created-at and --cursor-id are required with a valid ISO timestamp'
    )
  }

  console.log('=== Retry Mux Uploads Meta Script ===')
  console.log(`Limit: ${limit ?? 'all'}`)
  console.log(`Scan page size: ${scanPageSize}`)
  console.log(`CSV export: ${exportCsvPath}`)
  console.log(`Dry run: ${dryRun ? 'yes' : 'no'}`)
  console.log(`State file: ${statePath}`)
  if (cursorCreatedAt && cursorId) {
    console.log(`Cursor createdAt: ${cursorCreatedAt.toISOString()}`)
    console.log(`Cursor id: ${cursorId}`)
  }
  if (exportOnly) {
    console.log('Mode: export-only (no processing)')
  } else {
    console.log('Mode: export + process')
  }
  console.log('')

  let nextCursorCreatedAt = cursorCreatedAt
  let nextCursorId = cursorId
  let batchIndex = 0

  while (true) {
    batchIndex++
    console.log(`\n=== Batch ${batchIndex} ===`)

    const scanResult = await retryMuxUploads({
      dryRun: true,
      limit,
      exportCsvPath,
      cursorCreatedAt: nextCursorCreatedAt,
      cursorId: nextCursorId,
      scanPageSize
    })

    if (scanResult.nextCursorCreatedAt && scanResult.nextCursorId) {
      nextCursorCreatedAt = new Date(scanResult.nextCursorCreatedAt)
      nextCursorId = scanResult.nextCursorId
      await writeState(statePath, {
        cursorCreatedAt: scanResult.nextCursorCreatedAt,
        cursorId: scanResult.nextCursorId,
        exportCsvPath,
        lastRunAt: new Date().toISOString(),
        limit,
        scanPageSize
      })
    }

    if (exportOnly) {
      if (!scanResult.nextCursorCreatedAt || !scanResult.nextCursorId) {
        break
      }
      continue
    }

    await processCsvIssues(exportCsvPath, dryRun, undefined, muxUserId)

    if (!scanResult.nextCursorCreatedAt || !scanResult.nextCursorId) {
      break
    }
  }
}

if (require.main === module) {
  void main()
}
