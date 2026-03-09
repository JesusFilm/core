import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

const OUTPUT_CSV_PATH =
  'apis/api-media/src/scripts/bc-migration-helpers/to-be-migrated.csv'

/**
 * Add new segment prefixes here when you need explicit grouping control.
 * Example: all `1_jf6101-0-0`, `1_jf6102-0-0` become `1_jf61`.
 */
const SEGMENT_PREFIX_GROUPS = ['1_jf61', '1_wl6044', '1_cl13']

interface CsvRow {
  videoId: string
  r2Asset: 'no'
  version: number
  languageId: string
}

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value).replace(/\r\n|\r|\n/g, ' ').trim()
  const escaped = stringValue.replace(/"/g, '""')
  return /[",]/.test(stringValue) ? `"${escaped}"` : escaped
}

function buildCsv(rows: CsvRow[]): string {
  const header = ['videoId', 'r2Asset', 'version#', 'languageId']
  const body = rows.map((row) =>
    [row.videoId, row.r2Asset, row.version, row.languageId].map(csvEscape).join(',')
  )

  return [header.join(','), ...body].join('\n')
}

function toSegmentVideoId(videoId: string): string {
  for (const prefix of SEGMENT_PREFIX_GROUPS) {
    if (videoId.startsWith(prefix)) {
      return prefix
    }
  }

  // Generic fallback: `<segment><nn>-0-0` -> `<segment>`
  const genericSegmentMatch = videoId.match(/^(.+?)(\d{2})-0-0$/)
  if (genericSegmentMatch) {
    return genericSegmentMatch[1]
  }

  return videoId
}

function toGroupKey(segmentVideoId: string, languageId: string): string {
  return `${segmentVideoId}|${languageId}`
}

async function main(): Promise<void> {
  console.log('=== Export To Be Migrated CSV ===')
  console.log(`Output: ${OUTPUT_CSV_PATH}`)

  const variants = await prisma.videoVariant.findMany({
    where: {
      AND: [{ hls: { not: null } }, { hls: { not: '' } }],
      muxVideoId: null
    },
    select: {
      videoId: true,
      languageId: true,
      version: true
    },
    orderBy: [{ videoId: 'asc' }, { languageId: 'asc' }]
  })

  console.log(`Candidate variants found: ${variants.length}`)

  const grouped = new Map<string, CsvRow>()

  for (const variant of variants) {
    const segmentVideoId = toSegmentVideoId(variant.videoId)
    const key = toGroupKey(segmentVideoId, variant.languageId)
    const existing = grouped.get(key)

    if (!existing) {
      grouped.set(key, {
        videoId: segmentVideoId,
        r2Asset: 'no',
        version: variant.version,
        languageId: variant.languageId
      })
      continue
    }

    // Keep the highest version number in a grouped segment/language pair.
    if (variant.version > existing.version) {
      existing.version = variant.version
    }
  }

  const rows = Array.from(grouped.values()).sort((a, b) => {
    if (a.videoId !== b.videoId) {
      return a.videoId.localeCompare(b.videoId)
    }
    return a.languageId.localeCompare(b.languageId)
  })

  await writeFile(resolve(OUTPUT_CSV_PATH), buildCsv(rows), 'utf8')

  console.log(`Export complete. Rows: ${rows.length}`)
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
