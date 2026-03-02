import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

const TARGET_USER_ID = 'hvuvjOW1bnPsqanxufhqnL5SG233'
// Use a separate file so "export again to double-check" does not overwrite the
// pipeline CSV (retry-mux-r2.csv) used by process-mux-retry-csv and finalize-mux-retry-csv.
const OUTPUT_CSV_PATH = 'apis/api-media/src/scripts/retry-mux-export.csv'

// Same regex as video-importer uses
const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)---([^-]+)(?:---([^-]+))*\.mp4$/

interface ParsedVideoMetadata {
  videoId: string
  edition: string
  languageId: string
  version: number
}

interface CsvRow {
  r2AssetId: string
  r2PublicUrl: string
  originalFilename: string
  videoId: string
  languageId: string
  edition: string
  version: number
  missingMuxVideoId: boolean
  muxStatus: string
  muxErrorMessage: string
}

interface ComboMeta {
  comboKey: string
  videoId: string
  languageId: string
}

function csvEscape(
  value: string | number | boolean | null | undefined
): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value).replace(/\r\n|\r|\n/g, ' ').trim()
  const needsQuotes = /[",]/.test(stringValue)
  const escaped = stringValue.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function parseVideoFilename(filename: string): ParsedVideoMetadata | null {
  const match = filename.match(VIDEO_FILENAME_REGEX)
  if (!match) return null

  const [, videoId, editionName, languageId, version] = match
  const edition = editionName.toLowerCase()
  const parsedVersion = Number.parseInt(version, 10)

  if (Number.isNaN(parsedVersion)) {
    return null
  }

  return {
    videoId,
    edition,
    languageId,
    version: parsedVersion
  }
}

function buildCsv(rows: CsvRow[]): string {
  const header = [
    'r2AssetId',
    'r2PublicUrl',
    'originalFilename',
    'videoId',
    'languageId',
    'edition',
    'version',
    'missingMuxVideoId',
    'muxStatus',
    'muxErrorMessage'
  ]

  const body = rows.map((row) =>
    [
      row.r2AssetId,
      row.r2PublicUrl,
      row.originalFilename,
      row.videoId,
      row.languageId,
      row.edition,
      row.version,
      row.missingMuxVideoId,
      row.muxStatus,
      row.muxErrorMessage
    ]
      .map(csvEscape)
      .join(',')
  )

  return [header.join(','), ...body].join('\n')
}

async function main(): Promise<void> {
  const rows: CsvRow[] = []
  let skippedInvalid = 0
  const logEvery = 1000

  console.log('=== Export Mux Retry CSV ===')
  console.log(`Output: ${OUTPUT_CSV_PATH}`)
  const r2Assets = await prisma.cloudflareR2.findMany({
    where: {
      contentType: 'video/mp4',
      publicUrl: { not: null },
      originalFilename: { not: null },
      userId: TARGET_USER_ID
    },
    select: {
      id: true,
      publicUrl: true,
      originalFilename: true,
      videoId: true
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
  })

  console.log(`Total R2 assets found: ${r2Assets.length}`)

  let missingMuxVideoIdCount = 0
  const comboLookup = new Map<string, ComboMeta>()
  const assetsWithMetadata: Array<{
    r2AssetId: string
    r2PublicUrl: string
    originalFilename: string
    metadata: ParsedVideoMetadata
    comboKey: string
  }> = []

  let parsedCount = 0
  for (const r2Asset of r2Assets) {
    if (!r2Asset.originalFilename || !r2Asset.publicUrl) {
      skippedInvalid++
      continue
    }

    const metadata = parseVideoFilename(r2Asset.originalFilename)
    if (!metadata) {
      skippedInvalid++
      continue
    }

    const comboKey = `${metadata.videoId}|${metadata.languageId}`
    assetsWithMetadata.push({
      r2AssetId: r2Asset.id,
      r2PublicUrl: r2Asset.publicUrl,
      originalFilename: r2Asset.originalFilename,
      metadata,
      comboKey
    })

    if (!comboLookup.has(comboKey)) {
      comboLookup.set(comboKey, {
        comboKey,
        videoId: metadata.videoId,
        languageId: metadata.languageId
      })
    }

    parsedCount++
    if (parsedCount % logEvery === 0) {
      console.log(`Parsed ${parsedCount}/${r2Assets.length} assets`)
    }
  }

  const comboList = Array.from(comboLookup.values())
  const comboMuxVideoIdMap = new Map<string, boolean>()
  const comboChunkSize = 500
  let comboChecked = 0
  let comboFound = 0

  for (let i = 0; i < comboList.length; i += comboChunkSize) {
    const chunk = comboList.slice(i, i + comboChunkSize)

    const variants = await prisma.videoVariant.findMany({
      where: {
        OR: chunk.map((combo) => ({
          videoId: combo.videoId,
          languageId: combo.languageId
        }))
      },
      select: {
        id: true,
        videoId: true,
        languageId: true,
        muxVideoId: true
      }
    })

    for (const variant of variants) {
      const comboKey = `${variant.videoId}|${variant.languageId}`
      if (variant.muxVideoId) {
        comboMuxVideoIdMap.set(comboKey, true)
      }
    }

    comboChecked += chunk.length
    comboFound += variants.length
    if (comboChecked % 2000 === 0 || comboChecked === comboList.length) {
      console.log(
        `Checked ${comboChecked}/${comboList.length} unique combos (variants found: ${comboFound})`
      )
    }
  }

  for (const asset of assetsWithMetadata) {
    const hasMuxVideoId = comboMuxVideoIdMap.get(asset.comboKey) === true
    if (!hasMuxVideoId) {
      missingMuxVideoIdCount++
      rows.push({
        r2AssetId: asset.r2AssetId,
        r2PublicUrl: asset.r2PublicUrl,
        originalFilename: asset.originalFilename,
        videoId: asset.metadata.videoId,
        languageId: asset.metadata.languageId,
        edition: asset.metadata.edition,
        version: asset.metadata.version,
        missingMuxVideoId: true,
        muxStatus: '',
        muxErrorMessage: ''
      })
    }
  }

  const csvContents = buildCsv(rows)
  await writeFile(resolve(OUTPUT_CSV_PATH), csvContents, 'utf8')

  console.log(`\nExport complete.`)
  console.log(`Rows: ${rows.length}`)
  console.log(`Invalid filenames skipped: ${skippedInvalid}`)
  console.log(`Missing muxVideoId: ${missingMuxVideoIdCount}`)
  console.log(
    `Next: run process-mux-retry-csv, then finalize-mux-retry-csv. To re-check counts, run this export again; it writes here so the pipeline CSV (retry-mux-r2.csv) is not overwritten.`
  )
}

if (require.main === module) {
  void main()
    .catch((error) => {
      console.error('Export failed:', error)
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
