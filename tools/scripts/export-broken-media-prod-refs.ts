import { createWriteStream } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadDotenv } from 'dotenv'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

/*
 * Read-only export for broken legacy arclight-media-prod CloudFront references.
 *
 * Load the target env first, then run:
 *   set -a && source apis/api-media/.env && set +a
 *   pnpm exec nx run api-media:export-broken-media-prod-refs
 *
 * Outputs:
 *   .cache/arclight-media-prod-refs/<timestamp>/summary.json
 *   .cache/arclight-media-prod-refs/<timestamp>/shortlinks.jsonl
 *   .cache/arclight-media-prod-refs/<timestamp>/video-variants.jsonl
 */

type MediaClient = InstanceType<typeof PrismaClient>

type PatternMap = Record<string, number>

interface Args {
  envFile: string | null
  outputDir: string
  host: string
  batchSize: number
}

interface ShortLinkExportRow {
  id: string
  pathname: string
  shortUrl: string
  domainHostname: string
  domainApexName: string
  to: string
  targetHost: string | null
  targetPathname: string | null
  targetExtension: string | null
  targetPathPrefix: string | null
  service: string
  redirectType: string | null
  brightcoveId: string | null
  bitrate: number | null
  userId: string | null
  createdAt: string
  updatedAt: string
}

interface VideoVariantExportRow {
  id: string
  slug: string
  videoId: string
  languageId: string
  edition: string
  masterUrl: string
  targetHost: string | null
  targetPathname: string | null
  targetExtension: string | null
  targetPathPrefix: string | null
  published: boolean
  downloadable: boolean
  duration: number | null
  lengthInMilliseconds: number | null
  masterWidth: number | null
  masterHeight: number | null
  assetId: string | null
  muxVideoId: string | null
  brightcoveId: string | null
  createdAt: string
  updatedAt: string
}

interface Summary {
  generatedAt: string
  host: string
  outputDir: string
  counts: {
    shortLinks: number
    videoVariants: number
  }
  shortLinks: {
    byDomain: PatternMap
    byService: PatternMap
    byRedirectType: PatternMap
    byTargetExtension: PatternMap
    byTargetPathPrefix: PatternMap
    samples: ShortLinkExportRow[]
  }
  videoVariants: {
    byEdition: PatternMap
    byPublished: PatternMap
    byAssetPresence: PatternMap
    byMuxPresence: PatternMap
    byBrightcovePresence: PatternMap
    byTargetExtension: PatternMap
    byTargetPathPrefix: PatternMap
    samples: VideoVariantExportRow[]
  }
}

const DEFAULT_HOST = 'd2b2n918ty14xg.cloudfront.net'
const DEFAULT_BATCH_SIZE = 5_000
const SAMPLE_LIMIT = 20

function parseArgs(argv: string[]): Args {
  const args: Args = {
    envFile: null,
    outputDir: path.resolve(
      '.cache/arclight-media-prod-refs',
      new Date().toISOString().replace(/[:.]/g, '-')
    ),
    host: DEFAULT_HOST,
    batchSize: DEFAULT_BATCH_SIZE
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--env-file') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--env-file requires a path')
      args.envFile = path.resolve(value)
      index += 1
    } else if (arg === '--output-dir') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--output-dir requires a path')
      args.outputDir = path.resolve(value)
      index += 1
    } else if (arg === '--host') {
      const value = argv[index + 1]
      if (value == null)
        throw new Error('--host requires a CloudFront hostname')
      args.host = value
      index += 1
    } else if (arg === '--batch-size') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--batch-size requires a number')
      args.batchSize = Number(value)
      if (!Number.isInteger(args.batchSize) || args.batchSize < 1) {
        throw new Error('--batch-size must be a positive integer')
      }
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function loadEnvFile(envFile: string | null): void {
  if (envFile == null) return

  const result = loadDotenv({ path: envFile, override: true })
  if (result.error != null) throw result.error
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') throw new Error(`Missing ${name}`)
  return value
}

function createMediaClient(connectionString: string): MediaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000
    })
  })
}

function increment(map: PatternMap, key: string | null | undefined): void {
  const normalized = key == null || key === '' ? '(blank)' : key
  map[normalized] = (map[normalized] ?? 0) + 1
}

function topEntries(map: PatternMap, limit = 25): PatternMap {
  return Object.fromEntries(
    Object.entries(map)
      .sort(([, left], [, right]) => right - left)
      .slice(0, limit)
  )
}

function parseUrl(value: string): {
  host: string | null
  pathname: string | null
  extension: string | null
  pathPrefix: string | null
} {
  try {
    const url = new URL(value)
    const extension = path.extname(url.pathname).toLowerCase() || null
    const parts = url.pathname.split('/').filter(Boolean)
    const pathPrefix = parts.slice(0, 3).join('/') || null

    return {
      host: url.host,
      pathname: url.pathname,
      extension,
      pathPrefix
    }
  } catch {
    return { host: null, pathname: null, extension: null, pathPrefix: null }
  }
}

function writeJsonLine(stream: NodeJS.WritableStream, row: unknown): void {
  stream.write(`${JSON.stringify(row)}\n`)
}

async function exportShortLinks(
  prisma: MediaClient,
  host: string,
  outputPath: string,
  batchSize: number,
  summary: Summary
): Promise<void> {
  const stream = createWriteStream(outputPath, { encoding: 'utf-8' })
  let cursor: string | undefined

  try {
    while (true) {
      const rows = await prisma.shortLink.findMany({
        where: { to: { contains: host } },
        orderBy: { id: 'asc' },
        take: batchSize,
        ...(cursor != null ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: {
          id: true,
          pathname: true,
          to: true,
          userId: true,
          service: true,
          brightcoveId: true,
          redirectType: true,
          bitrate: true,
          createdAt: true,
          updatedAt: true,
          domain: {
            select: {
              hostname: true,
              apexName: true
            }
          }
        }
      })

      if (rows.length === 0) break

      for (const row of rows) {
        const parsed = parseUrl(row.to)
        const exportRow: ShortLinkExportRow = {
          id: row.id,
          pathname: row.pathname,
          shortUrl: `https://${row.domain.hostname}/${row.pathname}`,
          domainHostname: row.domain.hostname,
          domainApexName: row.domain.apexName,
          to: row.to,
          targetHost: parsed.host,
          targetPathname: parsed.pathname,
          targetExtension: parsed.extension,
          targetPathPrefix: parsed.pathPrefix,
          service: row.service,
          redirectType: row.redirectType,
          brightcoveId: row.brightcoveId,
          bitrate: row.bitrate,
          userId: row.userId,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString()
        }

        summary.counts.shortLinks += 1
        increment(summary.shortLinks.byDomain, exportRow.domainHostname)
        increment(summary.shortLinks.byService, exportRow.service)
        increment(summary.shortLinks.byRedirectType, exportRow.redirectType)
        increment(
          summary.shortLinks.byTargetExtension,
          exportRow.targetExtension
        )
        increment(
          summary.shortLinks.byTargetPathPrefix,
          exportRow.targetPathPrefix
        )
        if (summary.shortLinks.samples.length < SAMPLE_LIMIT) {
          summary.shortLinks.samples.push(exportRow)
        }

        writeJsonLine(stream, exportRow)
      }

      cursor = rows.at(-1)?.id
      console.info(`shortLinks exported: ${summary.counts.shortLinks}`)
    }
  } finally {
    stream.end()
  }
}

async function exportVideoVariants(
  prisma: MediaClient,
  host: string,
  outputPath: string,
  batchSize: number,
  summary: Summary
): Promise<void> {
  const stream = createWriteStream(outputPath, { encoding: 'utf-8' })
  let cursor: string | undefined

  try {
    while (true) {
      const rows = await prisma.videoVariant.findMany({
        where: { masterUrl: { contains: host } },
        orderBy: { id: 'asc' },
        take: batchSize,
        ...(cursor != null ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: {
          id: true,
          slug: true,
          videoId: true,
          languageId: true,
          edition: true,
          masterUrl: true,
          published: true,
          downloadable: true,
          duration: true,
          lengthInMilliseconds: true,
          masterWidth: true,
          masterHeight: true,
          assetId: true,
          muxVideoId: true,
          brightcoveId: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (rows.length === 0) break

      for (const row of rows) {
        if (row.masterUrl == null) continue
        const parsed = parseUrl(row.masterUrl)
        const exportRow: VideoVariantExportRow = {
          id: row.id,
          slug: row.slug,
          videoId: row.videoId,
          languageId: row.languageId,
          edition: row.edition,
          masterUrl: row.masterUrl,
          targetHost: parsed.host,
          targetPathname: parsed.pathname,
          targetExtension: parsed.extension,
          targetPathPrefix: parsed.pathPrefix,
          published: row.published,
          downloadable: row.downloadable,
          duration: row.duration,
          lengthInMilliseconds: row.lengthInMilliseconds,
          masterWidth: row.masterWidth,
          masterHeight: row.masterHeight,
          assetId: row.assetId,
          muxVideoId: row.muxVideoId,
          brightcoveId: row.brightcoveId,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString()
        }

        summary.counts.videoVariants += 1
        increment(summary.videoVariants.byEdition, exportRow.edition)
        increment(
          summary.videoVariants.byPublished,
          String(exportRow.published)
        )
        increment(
          summary.videoVariants.byAssetPresence,
          exportRow.assetId == null ? 'missing assetId' : 'has assetId'
        )
        increment(
          summary.videoVariants.byMuxPresence,
          exportRow.muxVideoId == null ? 'missing muxVideoId' : 'has muxVideoId'
        )
        increment(
          summary.videoVariants.byBrightcovePresence,
          exportRow.brightcoveId == null
            ? 'missing brightcoveId'
            : 'has brightcoveId'
        )
        increment(
          summary.videoVariants.byTargetExtension,
          exportRow.targetExtension
        )
        increment(
          summary.videoVariants.byTargetPathPrefix,
          exportRow.targetPathPrefix
        )
        if (summary.videoVariants.samples.length < SAMPLE_LIMIT) {
          summary.videoVariants.samples.push(exportRow)
        }

        writeJsonLine(stream, exportRow)
      }

      cursor = rows.at(-1)?.id
      console.info(`videoVariants exported: ${summary.counts.videoVariants}`)
    }
  } finally {
    stream.end()
  }
}

function createSummary(host: string, outputDir: string): Summary {
  return {
    generatedAt: new Date().toISOString(),
    host,
    outputDir,
    counts: {
      shortLinks: 0,
      videoVariants: 0
    },
    shortLinks: {
      byDomain: {},
      byService: {},
      byRedirectType: {},
      byTargetExtension: {},
      byTargetPathPrefix: {},
      samples: []
    },
    videoVariants: {
      byEdition: {},
      byPublished: {},
      byAssetPresence: {},
      byMuxPresence: {},
      byBrightcovePresence: {},
      byTargetExtension: {},
      byTargetPathPrefix: {},
      samples: []
    }
  }
}

function compactSummary(summary: Summary): Summary {
  return {
    ...summary,
    shortLinks: {
      ...summary.shortLinks,
      byDomain: topEntries(summary.shortLinks.byDomain),
      byService: topEntries(summary.shortLinks.byService),
      byRedirectType: topEntries(summary.shortLinks.byRedirectType),
      byTargetExtension: topEntries(summary.shortLinks.byTargetExtension),
      byTargetPathPrefix: topEntries(summary.shortLinks.byTargetPathPrefix)
    },
    videoVariants: {
      ...summary.videoVariants,
      byEdition: topEntries(summary.videoVariants.byEdition),
      byPublished: topEntries(summary.videoVariants.byPublished),
      byAssetPresence: topEntries(summary.videoVariants.byAssetPresence),
      byMuxPresence: topEntries(summary.videoVariants.byMuxPresence),
      byBrightcovePresence: topEntries(
        summary.videoVariants.byBrightcovePresence
      ),
      byTargetExtension: topEntries(summary.videoVariants.byTargetExtension),
      byTargetPathPrefix: topEntries(summary.videoVariants.byTargetPathPrefix)
    }
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  loadEnvFile(args.envFile)
  await mkdir(args.outputDir, { recursive: true })

  const prisma = createMediaClient(requireEnv('PG_DATABASE_URL_MEDIA'))
  const summary = createSummary(args.host, args.outputDir)
  const shortLinksPath = path.join(args.outputDir, 'shortlinks.jsonl')
  const videoVariantsPath = path.join(args.outputDir, 'video-variants.jsonl')
  const summaryPath = path.join(args.outputDir, 'summary.json')

  try {
    await exportShortLinks(
      prisma,
      args.host,
      shortLinksPath,
      args.batchSize,
      summary
    )
    await exportVideoVariants(
      prisma,
      args.host,
      videoVariantsPath,
      args.batchSize,
      summary
    )
  } finally {
    await prisma.$disconnect()
  }

  const finalSummary = compactSummary(summary)
  await writeFile(summaryPath, JSON.stringify(finalSummary, null, 2), 'utf-8')

  console.info('')
  console.info('=== BROKEN MEDIA-PROD REF EXPORT ===')
  console.info(`host: ${args.host}`)
  console.info(`shortLinks: ${finalSummary.counts.shortLinks}`)
  console.info(`videoVariants: ${finalSummary.counts.videoVariants}`)
  console.info(`summary: ${summaryPath}`)
  console.info(`shortLinks export: ${shortLinksPath}`)
  console.info(`videoVariants export: ${videoVariantsPath}`)
  console.info('')
  console.info('ShortLink top target prefixes:')
  console.info(
    JSON.stringify(finalSummary.shortLinks.byTargetPathPrefix, null, 2)
  )
  console.info('')
  console.info('VideoVariant top target prefixes:')
  console.info(
    JSON.stringify(finalSummary.videoVariants.byTargetPathPrefix, null, 2)
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
