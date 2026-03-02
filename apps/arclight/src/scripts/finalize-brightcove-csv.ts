import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createInterface } from 'node:readline'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

const DEFAULT_INPUT_PATH =
  'apps/arclight/src/scripts/brightcove-content-enriched.csv'
const DEFAULT_OUTPUT_PATH = 'apps/arclight/src/scripts/brightcove-content-final.csv'
const DEFAULT_MISSING_OUTPUT_PATH =
  'apps/arclight/src/scripts/brightcove-content-final-missing.csv'
const DEFAULT_QUERY_CHUNK_SIZE = 500

interface FinalRow {
  referenceId: string
  name: string
  videoId: string
  languageId: string
  updatedAt: string
  versionNumber: string
  videoVariantExists: string
  muxVideoIdExists: string
}

function sortByVideoId(rows: FinalRow[]): FinalRow[] {
  return [...rows].sort((a, b) => {
    const videoIdComparison = a.videoId.localeCompare(b.videoId)
    if (videoIdComparison !== 0) return videoIdComparison
    return a.languageId.localeCompare(b.languageId)
  })
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return parsed
}

function parseCsvLine(line: string): string[] {
  const columns: string[] = []
  let current = ''
  let insideQuotes = false

  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        index++
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (char === ',' && !insideQuotes) {
      columns.push(current)
      current = ''
      continue
    }

    current += char
  }

  columns.push(current)
  return columns
}

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""')
  if (/[",\n\r]/.test(escaped)) return `"${escaped}"`
  return escaped
}

function getValueByHeader(
  headers: string[],
  row: string[],
  headerName: string
): string {
  const index = headers.indexOf(headerName)
  if (index < 0) return ''
  return row[index] ?? ''
}

function toPairKey(videoId: string, languageId: string): string {
  return `${videoId}|${languageId}`
}

function toTimestamp(value: string): number | null {
  if (!value.trim()) return null
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  return parsed
}

function inferVersionFromReferenceId(referenceId: string): string {
  const match = referenceId.match(/^([A-Za-z0-9]+)_([0-9]+)-(.+?)_[0-9]+$/)
  if (!match) return ''

  const componentSlug = match[3] ?? ''
  const slugSegments = componentSlug
    .split('-')
    .map((segment) => segment.trim())
    .filter(Boolean)

  if (slugSegments.length < 2) return ''
  if (!/^\d+$/.test(slugSegments[0])) return ''
  if (slugSegments[0] === '0') return ''

  return slugSegments[0]
}

async function writeCsv(path: string, rows: FinalRow[]): Promise<void> {
  await mkdir(dirname(resolve(path)), { recursive: true })

  const writer = createWriteStream(resolve(path), { encoding: 'utf8' })
  const header = [
    'referenceId',
    'name',
    'videoId',
    'languageId',
    'updatedAt',
    'versionNumber',
    'videoVariantExists',
    'muxVideoIdExists'
  ]

  const writeLine = async (line: string): Promise<void> => {
    if (writer.write(`${line}\n`)) return
    await new Promise<void>((resolvePromise, rejectPromise) => {
      writer.once('drain', resolvePromise)
      writer.once('error', rejectPromise)
    })
  }

  await writeLine(header.map(csvEscape).join(','))
  for (const row of rows) {
    await writeLine(
      [
        row.referenceId,
        row.name,
        row.videoId,
        row.languageId,
        row.updatedAt,
        row.versionNumber,
        row.videoVariantExists,
        row.muxVideoIdExists
      ]
        .map(csvEscape)
        .join(',')
    )
  }

  await new Promise<void>((resolvePromise, rejectPromise) => {
    writer.end(() => resolvePromise())
    writer.once('error', rejectPromise)
  })
}

async function main(): Promise<void> {
  const inputPath = process.env.BC_FINALIZE_INPUT_PATH || DEFAULT_INPUT_PATH
  const outputPath = process.env.BC_FINALIZE_OUTPUT_PATH || DEFAULT_OUTPUT_PATH
  const missingOutputPath =
    process.env.BC_FINALIZE_MISSING_OUTPUT_PATH || DEFAULT_MISSING_OUTPUT_PATH
  const queryChunkSize = parsePositiveInt(
    process.env.BC_FINALIZE_QUERY_CHUNK_SIZE,
    DEFAULT_QUERY_CHUNK_SIZE
  )

  const inputStream = createReadStream(resolve(inputPath), { encoding: 'utf8' })
  const reader = createInterface({
    input: inputStream,
    crlfDelay: Infinity
  })

  const parsedRows: Array<{
    referenceId: string
    name: string
    videoId: string
    languageId: string
    updatedAt: string
  }> = []
  let headers: string[] | null = null
  let skippedMissingIds = 0

  for await (const rawLine of reader) {
    const line = headers ? rawLine : rawLine.replace(/^\uFEFF/, '')
    if (!line.trim()) continue

    const values = parseCsvLine(line)
    if (!headers) {
      headers = values
      continue
    }

    const referenceId = getValueByHeader(headers, values, 'referenceId')
    const name = getValueByHeader(headers, values, 'name')
    const inferredVideoId =
      getValueByHeader(headers, values, 'inferedFromStuff') ||
      getValueByHeader(headers, values, 'inferredMediaComponentId')
    const brightcoveVideoId = getValueByHeader(headers, values, 'videoId')
    const videoId = inferredVideoId || brightcoveVideoId
    const languageId = getValueByHeader(headers, values, 'languageId')
    const updatedAt = getValueByHeader(headers, values, 'updated_at')

    if (!videoId || !languageId) {
      skippedMissingIds++
      continue
    }

    parsedRows.push({
      referenceId,
      name,
      videoId,
      languageId,
      updatedAt
    })
  }

  const uniquePairMap = new Map<string, { videoId: string; languageId: string }>()
  for (const row of parsedRows) {
    const key = toPairKey(row.videoId, row.languageId)
    if (!uniquePairMap.has(key)) {
      uniquePairMap.set(key, { videoId: row.videoId, languageId: row.languageId })
    }
  }

  const uniquePairs = Array.from(uniquePairMap.values())
  const uniqueParsedRows = new Map<
    string,
    {
      referenceId: string
      name: string
      videoId: string
      languageId: string
      updatedAt: string
    }
  >()
  for (const row of parsedRows) {
    const pairKey = toPairKey(row.videoId, row.languageId)
    const existing = uniqueParsedRows.get(pairKey)
    if (!existing) {
      uniqueParsedRows.set(pairKey, row)
      continue
    }

    const existingTimestamp = toTimestamp(existing.updatedAt)
    const rowTimestamp = toTimestamp(row.updatedAt)

    if (existingTimestamp === null && rowTimestamp === null) continue
    if (existingTimestamp === null && rowTimestamp !== null) {
      uniqueParsedRows.set(pairKey, row)
      continue
    }
    if (
      existingTimestamp !== null &&
      rowTimestamp !== null &&
      rowTimestamp > existingTimestamp
    ) {
      uniqueParsedRows.set(pairKey, row)
    }
  }
  const deduplicatedRows = Array.from(uniqueParsedRows.values())
  const duplicateRowsCollapsed = parsedRows.length - deduplicatedRows.length
  const pairStatusMap = new Map<
    string,
    {
      videoVariantExists: boolean
      muxVideoIdExists: boolean
      versionNumber: string
    }
  >()

  for (let index = 0; index < uniquePairs.length; index += queryChunkSize) {
    const chunk = uniquePairs.slice(index, index + queryChunkSize)
    const variants = await prisma.videoVariant.findMany({
      where: {
        OR: chunk.map((pair) => ({
          videoId: pair.videoId,
          languageId: pair.languageId
        }))
      },
      select: {
        videoId: true,
        languageId: true,
        muxVideoId: true,
        version: true
      }
    })

    for (const variant of variants) {
      const key = toPairKey(variant.videoId, variant.languageId)
      const previous = pairStatusMap.get(key)
      pairStatusMap.set(key, {
        videoVariantExists: true,
        muxVideoIdExists: previous?.muxVideoIdExists || Boolean(variant.muxVideoId),
        versionNumber: `${variant.version}`
      })
    }

    const checked = Math.min(index + queryChunkSize, uniquePairs.length)
    if (checked % 5000 === 0 || checked === uniquePairs.length) {
      console.log(`Checked ${checked}/${uniquePairs.length} unique pairs`)
    }
  }

  const rows: FinalRow[] = deduplicatedRows.map((row) => {
    const pairKey = toPairKey(row.videoId, row.languageId)
    const pairStatus = pairStatusMap.get(pairKey)
    const versionFromReferenceId = inferVersionFromReferenceId(row.referenceId)
    const versionNumber = versionFromReferenceId || pairStatus?.versionNumber || ''
    const muxVideoIdExists = pairStatus?.muxVideoIdExists ? 'true' : 'false'

    return {
      referenceId: row.referenceId,
      name: row.name,
      videoId: row.videoId,
      languageId: row.languageId,
      updatedAt: row.updatedAt,
      versionNumber,
      videoVariantExists: pairStatus?.videoVariantExists ? 'true' : 'false',
      muxVideoIdExists
    }
  })

  const missingRows = rows.filter(
    (row) =>
      row.videoVariantExists === 'false' || row.muxVideoIdExists === 'false'
  )
  const missingMuxVideoIdRows = rows.filter(
    (row) =>
      row.videoVariantExists === 'true' && row.muxVideoIdExists === 'false'
  )
  const sortedRows = sortByVideoId(rows)
  const sortedMissingRows = sortByVideoId(missingRows)

  await writeCsv(outputPath, sortedRows)
  await writeCsv(missingOutputPath, sortedMissingRows)

  console.log('=== Finalize complete ===')
  console.log(`Input: ${inputPath}`)
  console.log(`Output: ${outputPath}`)
  console.log(`Missing output: ${missingOutputPath}`)
  console.log(`Rows written: ${sortedRows.length}`)
  console.log(`Rows missing ids skipped: ${skippedMissingIds}`)
  console.log(`Unique pairs checked: ${uniquePairs.length}`)
  console.log(`Duplicate rows collapsed: ${duplicateRowsCollapsed}`)
  console.log(
    `Missing rows (no matching videoVariant or muxVideoId): ${missingRows.length}`
  )
  console.log(`Rows with missing muxVideoId: ${missingMuxVideoIdRows.length}`)
}

if (require.main === module) {
  void main()
    .catch((error) => {
      console.error('Finalize failed:', error)
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
