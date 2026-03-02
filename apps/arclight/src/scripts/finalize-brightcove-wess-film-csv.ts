import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createInterface } from 'node:readline'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

const DEFAULT_INPUT_PATH =
  'apps/arclight/src/scripts/brightcove-content-enriched.csv'
const DEFAULT_OUTPUT_PATH =
  'apps/arclight/src/scripts/brightcove-content-final-wess-films.csv'
const DEFAULT_MISSING_OUTPUT_PATH =
  'apps/arclight/src/scripts/brightcove-content-final-wess-films-missing.csv'
const DEFAULT_QUERY_CHUNK_SIZE = 500

interface ParsedRow {
  referenceId: string
  name: string
  videoId: string
  languageId: string
  updatedAt: string
}

interface GroupRow {
  referenceId: string
  videoId: string
  languageId: string
  name: string
  updatedAt: string
  groupMemberVideoIds: string
  videoVariantExists: string
  muxVideoIdExists: string
  isFeatureMissing: string
  isAnyClipMissing: string
}

interface PairStatus {
  videoVariantExists: boolean
  muxVideoIdExists: boolean
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

function selectNewestRow(current: ParsedRow, candidate: ParsedRow): ParsedRow {
  const currentTimestamp = toTimestamp(current.updatedAt)
  const candidateTimestamp = toTimestamp(candidate.updatedAt)

  if (currentTimestamp === null && candidateTimestamp === null) return current
  if (currentTimestamp === null && candidateTimestamp !== null) return candidate
  if (
    currentTimestamp !== null &&
    candidateTimestamp !== null &&
    candidateTimestamp > currentTimestamp
  ) {
    return candidate
  }
  return current
}

function toWessFilmVideoId(videoId: string): string | null {
  if (!videoId.startsWith('1_')) return null
  const slug = videoId.slice(2)
  const [component] = slug.split('-')
  if (!component) return null

  const prefixMatch = component.toLowerCase().match(/^[a-z]+/)
  if (!prefixMatch) return null

  return `1_${prefixMatch[0]}-0-0`
}

function sortByFilmVideoId(rows: GroupRow[]): GroupRow[] {
  return [...rows].sort((a, b) => {
    const filmComparison = a.videoId.localeCompare(b.videoId)
    if (filmComparison !== 0) return filmComparison
    return a.languageId.localeCompare(b.languageId)
  })
}

async function writeCsv(path: string, rows: GroupRow[]): Promise<void> {
  await mkdir(dirname(resolve(path)), { recursive: true })
  const writer = createWriteStream(resolve(path), { encoding: 'utf8' })

  const errorPromise = new Promise<never>((_resolve, reject) => {
    writer.once('error', reject)
  })

  const header = [
    'referenceId',
    'videoId',
    'languageId',
    'name',
    'updatedAt',
    'groupMemberVideoIds',
    'videoVariantExists',
    'muxVideoIdExists',
    'isFeatureMissing',
    'isAnyClipMissing'
  ]
  if (!writer.write(`${header.map(csvEscape).join(',')}\n`)) {
    await Promise.race([
      new Promise<void>((resolvePromise) => writer.once('drain', resolvePromise)),
      errorPromise
    ])
  }

  for (const row of rows) {
    const line = [
      row.referenceId,
      row.videoId,
      row.languageId,
      row.name,
      row.updatedAt,
      row.groupMemberVideoIds,
      row.videoVariantExists,
      row.muxVideoIdExists,
      row.isFeatureMissing,
      row.isAnyClipMissing
    ]
      .map(csvEscape)
      .join(',')

    if (writer.write(`${line}\n`)) continue
    await Promise.race([
      new Promise<void>((resolvePromise) => writer.once('drain', resolvePromise)),
      errorPromise
    ])
  }

  await Promise.race([
    new Promise<void>((resolvePromise) => writer.end(() => resolvePromise())),
    errorPromise
  ])
}

async function main(): Promise<void> {
  const inputPath = process.env.BC_FINALIZE_INPUT_PATH || DEFAULT_INPUT_PATH
  const outputPath =
    process.env.BC_WESS_FILM_OUTPUT_PATH || DEFAULT_OUTPUT_PATH
  const missingOutputPath =
    process.env.BC_WESS_FILM_MISSING_OUTPUT_PATH || DEFAULT_MISSING_OUTPUT_PATH
  const queryChunkSize = parsePositiveInt(
    process.env.BC_FINALIZE_QUERY_CHUNK_SIZE,
    DEFAULT_QUERY_CHUNK_SIZE
  )

  const inputStream = createReadStream(resolve(inputPath), { encoding: 'utf8' })
  const reader = createInterface({
    input: inputStream,
    crlfDelay: Infinity
  })

  const parsedRows: ParsedRow[] = []
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

    if (!videoId.startsWith('1_')) continue
    if (!referenceId.startsWith('WESS_')) continue

    parsedRows.push({
      referenceId,
      name,
      videoId,
      languageId,
      updatedAt
    })
  }

  const deduplicatedPairs = new Map<string, ParsedRow>()
  for (const row of parsedRows) {
    const pairKey = toPairKey(row.videoId, row.languageId)
    const existing = deduplicatedPairs.get(pairKey)
    if (!existing) {
      deduplicatedPairs.set(pairKey, row)
      continue
    }
    deduplicatedPairs.set(pairKey, selectNewestRow(existing, row))
  }
  const deduplicatedRows = Array.from(deduplicatedPairs.values())

  const groupMap = new Map<
    string,
    {
      filmVideoId: string
      languageId: string
      latestRow: ParsedRow
      videoIds: Set<string>
    }
  >()

  for (const row of deduplicatedRows) {
    const filmVideoId = toWessFilmVideoId(row.videoId)
    if (!filmVideoId) continue

    const groupKey = toPairKey(filmVideoId, row.languageId)
    const existing = groupMap.get(groupKey)
    if (!existing) {
      groupMap.set(groupKey, {
        filmVideoId,
        languageId: row.languageId,
        latestRow: row,
        videoIds: new Set([row.videoId])
      })
      continue
    }

    existing.videoIds.add(row.videoId)
    existing.latestRow = selectNewestRow(existing.latestRow, row)
  }

  const groups = Array.from(groupMap.values())
  const lookupPairMap = new Map<string, { videoId: string; languageId: string }>()
  for (const group of groups) {
    lookupPairMap.set(toPairKey(group.filmVideoId, group.languageId), {
      videoId: group.filmVideoId,
      languageId: group.languageId
    })
    for (const videoId of group.videoIds) {
      lookupPairMap.set(toPairKey(videoId, group.languageId), {
        videoId,
        languageId: group.languageId
      })
    }
  }
  const lookupPairs = Array.from(lookupPairMap.values())

  const pairStatusMap = new Map<string, PairStatus>()
  for (let index = 0; index < lookupPairs.length; index += queryChunkSize) {
    const chunk = lookupPairs.slice(index, index + queryChunkSize)
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
        muxVideoId: true
      }
    })

    for (const variant of variants) {
      const key = toPairKey(variant.videoId, variant.languageId)
      const previous = pairStatusMap.get(key)
      pairStatusMap.set(key, {
        videoVariantExists: true,
        muxVideoIdExists: previous?.muxVideoIdExists || Boolean(variant.muxVideoId)
      })
    }
  }

  const rows: GroupRow[] = groups.map((group) => {
    let videoVariantExists = false
    let muxVideoIdExists = false

    const basePairStatus = pairStatusMap.get(
      toPairKey(group.filmVideoId, group.languageId)
    )
    const isFeatureMissing = !(
      basePairStatus?.videoVariantExists && basePairStatus?.muxVideoIdExists
    )

    let isAnyClipMissing = false
    const candidateIds = new Set<string>([group.filmVideoId, ...group.videoIds])
    for (const videoId of candidateIds) {
      const pairStatus = pairStatusMap.get(toPairKey(videoId, group.languageId))
      const isMissingForVideoId = !(
        pairStatus?.videoVariantExists && pairStatus?.muxVideoIdExists
      )
      if (videoId !== group.filmVideoId && isMissingForVideoId) {
        isAnyClipMissing = true
      }
      if (!pairStatus) continue
      if (pairStatus.videoVariantExists) videoVariantExists = true
      if (pairStatus.muxVideoIdExists) muxVideoIdExists = true
    }

    return {
      referenceId: group.latestRow.referenceId,
      videoId: group.filmVideoId,
      languageId: group.languageId,
      name: group.latestRow.name,
      updatedAt: group.latestRow.updatedAt,
      groupMemberVideoIds: Array.from(group.videoIds)
        .sort((a, b) => a.localeCompare(b))
        .join('|'),
      videoVariantExists: videoVariantExists ? 'true' : 'false',
      muxVideoIdExists: muxVideoIdExists ? 'true' : 'false',
      isFeatureMissing: isFeatureMissing ? 'true' : 'false',
      isAnyClipMissing: isAnyClipMissing ? 'true' : 'false'
    }
  })

  const missingRows = rows.filter(
    (row) => row.isFeatureMissing === 'true' || row.isAnyClipMissing === 'true'
  )
  const sortedRows = sortByFilmVideoId(rows)
  const sortedMissingRows = sortByFilmVideoId(missingRows)

  await writeCsv(outputPath, sortedRows)
  await writeCsv(missingOutputPath, sortedMissingRows)

  console.log('=== WESS film finalize complete ===')
  console.log(`Input: ${inputPath}`)
  console.log(`Output: ${outputPath}`)
  console.log(`Missing output: ${missingOutputPath}`)
  console.log(`Rows written: ${sortedRows.length}`)
  console.log(`Rows missing ids skipped: ${skippedMissingIds}`)
  console.log(`WESS video/language pairs considered: ${deduplicatedRows.length}`)
  console.log(`Film groups created: ${groups.length}`)
  console.log(`Lookup pairs checked: ${lookupPairs.length}`)
  console.log(`Missing rows: ${sortedMissingRows.length}`)
}

if (require.main === module) {
  void main()
    .catch((error) => {
      console.error('WESS film finalize failed:', error)
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
