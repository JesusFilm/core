import { createWriteStream } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadDotenv } from 'dotenv'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

/*
 * Deletes legacy arclight-media-prod CloudFront shortlinks by target extension.
 *
 * Default is a dry run. Load the target env first, then run:
 *   set -a && source apis/api-media/.env && set +a
 *   pnpm exec nx run api-media:delete-bad-media-shortlinks
 *
 * Apply:
 *   pnpm exec nx run api-media:delete-bad-media-shortlinks -- --apply
 *
 * Outputs:
 *   .cache/arclight-bad-shortlinks/<timestamp>/summary.json
 *   .cache/arclight-bad-shortlinks/<timestamp>/candidates.jsonl
 */

type MediaClient = InstanceType<typeof PrismaClient>

type PatternMap = Record<string, number>

interface Args {
  envFile: string | null
  apply: boolean
  outputDir: string
  host: string
  extensions: string[]
  domainHostname: string | null
  redirectType: string | null
  requireBrightcoveId: boolean
  batchSize: number
  deleteBatchSize: number
}

interface CandidateRow {
  id: string
  pathname: string
  shortUrl: string
  domainHostname: string
  domainApexName: string
  to: string
  targetHost: string | null
  targetPathname: string | null
  targetExtension: string | null
  service: string
  redirectType: string | null
  brightcoveId: string | null
  bitrate: number | null
  userId: string | null
  createdAt: string
  updatedAt: string
}

interface Summary {
  generatedAt: string
  mode: 'dry-run' | 'apply'
  host: string
  extensions: string[]
  domainHostname: string | null
  redirectType: string | null
  requireBrightcoveId: boolean
  outputDir: string
  scanned: number
  candidates: number
  deleted: number
  byTargetExtension: PatternMap
  byDomain: PatternMap
  byRedirectType: PatternMap
  byService: PatternMap
  samples: CandidateRow[]
}

const DEFAULT_HOST = 'd2b2n918ty14xg.cloudfront.net'
const DEFAULT_EXTENSIONS = ['.3gp', '.mpd', '.webm']
const DEFAULT_BATCH_SIZE = 5_000
const DEFAULT_DELETE_BATCH_SIZE = 1_000
const SAMPLE_LIMIT = 20

function parseArgs(argv: string[]): Args {
  const args: Args = {
    envFile: null,
    apply: false,
    outputDir: path.resolve(
      '.cache/arclight-bad-shortlinks',
      new Date().toISOString().replace(/[:.]/g, '-')
    ),
    host: DEFAULT_HOST,
    extensions: DEFAULT_EXTENSIONS,
    domainHostname: null,
    redirectType: null,
    requireBrightcoveId: false,
    batchSize: DEFAULT_BATCH_SIZE,
    deleteBatchSize: DEFAULT_DELETE_BATCH_SIZE
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--apply') {
      args.apply = true
    } else if (arg === '--env-file') {
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
    } else if (arg === '--extensions') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--extensions requires a CSV value')
      args.extensions = normalizeExtensions(value.split(','))
      index += 1
    } else if (arg === '--domain-hostname') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--domain-hostname requires a value')
      args.domainHostname = value
      index += 1
    } else if (arg === '--redirect-type') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--redirect-type requires a value')
      args.redirectType = value
      index += 1
    } else if (arg === '--require-brightcove-id') {
      args.requireBrightcoveId = true
    } else if (arg === '--batch-size') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--batch-size requires a number')
      args.batchSize = parsePositiveInteger('--batch-size', value)
      index += 1
    } else if (arg === '--delete-batch-size') {
      const value = argv[index + 1]
      if (value == null)
        throw new Error('--delete-batch-size requires a number')
      args.deleteBatchSize = parsePositiveInteger('--delete-batch-size', value)
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (args.extensions.length === 0) {
    throw new Error('--extensions must include at least one extension')
  }

  return args
}

function normalizeExtensions(extensions: string[]): string[] {
  return [
    ...new Set(
      extensions
        .map((extension) => extension.trim().toLowerCase())
        .filter(Boolean)
        .map((extension) =>
          extension.startsWith('.') ? extension : `.${extension}`
        )
    )
  ]
}

function parsePositiveInteger(name: string, value: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`)
  }
  return parsed
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
      connectionTimeoutMillis: 30_000,
      idleTimeoutMillis: 30_000
    })
  })
}

function parseTarget(value: string): {
  host: string | null
  pathname: string | null
  extension: string | null
} {
  try {
    const url = new URL(value)
    return {
      host: url.host,
      pathname: url.pathname,
      extension: path.extname(url.pathname).toLowerCase() || null
    }
  } catch {
    return { host: null, pathname: null, extension: null }
  }
}

function increment(map: PatternMap, key: string | null | undefined): void {
  const normalized = key == null || key === '' ? '(blank)' : key
  map[normalized] = (map[normalized] ?? 0) + 1
}

function writeJsonLine(stream: NodeJS.WritableStream, row: unknown): void {
  stream.write(`${JSON.stringify(row)}\n`)
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function retryDatabaseCall<T>(
  label: string,
  callback: () => Promise<T>
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await callback()
    } catch (error) {
      lastError = error
      console.warn(
        `${label} failed on attempt ${attempt}/3: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      if (attempt < 3) await sleep(attempt * 1_000)
    }
  }

  throw lastError
}

function createSummary(args: Args): Summary {
  return {
    generatedAt: new Date().toISOString(),
    mode: args.apply ? 'apply' : 'dry-run',
    host: args.host,
    extensions: args.extensions,
    domainHostname: args.domainHostname,
    redirectType: args.redirectType,
    requireBrightcoveId: args.requireBrightcoveId,
    outputDir: args.outputDir,
    scanned: 0,
    candidates: 0,
    deleted: 0,
    byTargetExtension: {},
    byDomain: {},
    byRedirectType: {},
    byService: {},
    samples: []
  }
}

async function deleteIds(
  prisma: MediaClient,
  ids: string[],
  deleteBatchSize: number
): Promise<number> {
  let deleted = 0

  for (let index = 0; index < ids.length; index += deleteBatchSize) {
    const batch = ids.slice(index, index + deleteBatchSize)
    const result = await retryDatabaseCall('delete shortlink batch', () =>
      prisma.shortLink.deleteMany({
        where: { id: { in: batch } }
      })
    )
    deleted += result.count
  }

  return deleted
}

async function scanShortLinks(
  prisma: MediaClient,
  args: Args,
  outputPath: string,
  summary: Summary
): Promise<string[]> {
  const stream = createWriteStream(outputPath, { encoding: 'utf-8' })
  const targetExtensions = new Set(args.extensions)
  const candidateIds: string[] = []
  let cursor: string | undefined

  try {
    while (true) {
      const rows = await retryDatabaseCall('read shortlink batch', () =>
        prisma.shortLink.findMany({
          where: { to: { contains: args.host } },
          orderBy: { id: 'asc' },
          take: args.batchSize,
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
      )

      if (rows.length === 0) break

      for (const row of rows) {
        summary.scanned += 1
        const parsed = parseTarget(row.to)
        if (!targetExtensions.has(parsed.extension ?? '')) continue
        if (
          args.domainHostname != null &&
          row.domain.hostname !== args.domainHostname
        ) {
          continue
        }
        if (
          args.redirectType != null &&
          row.redirectType !== args.redirectType
        ) {
          continue
        }
        if (args.requireBrightcoveId && row.brightcoveId == null) continue

        const candidate: CandidateRow = {
          id: row.id,
          pathname: row.pathname,
          shortUrl: `https://${row.domain.hostname}/${row.pathname}`,
          domainHostname: row.domain.hostname,
          domainApexName: row.domain.apexName,
          to: row.to,
          targetHost: parsed.host,
          targetPathname: parsed.pathname,
          targetExtension: parsed.extension,
          service: row.service,
          redirectType: row.redirectType,
          brightcoveId: row.brightcoveId,
          bitrate: row.bitrate,
          userId: row.userId,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString()
        }

        summary.candidates += 1
        increment(summary.byTargetExtension, candidate.targetExtension)
        increment(summary.byDomain, candidate.domainHostname)
        increment(summary.byRedirectType, candidate.redirectType)
        increment(summary.byService, candidate.service)
        if (summary.samples.length < SAMPLE_LIMIT) {
          summary.samples.push(candidate)
        }
        writeJsonLine(stream, candidate)
        candidateIds.push(row.id)
      }

      cursor = rows.at(-1)?.id
      console.info(
        `shortLinks scanned=${summary.scanned} candidates=${summary.candidates} deleted=${summary.deleted}`
      )
    }
  } finally {
    stream.end()
  }

  return candidateIds
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  loadEnvFile(args.envFile)
  await mkdir(args.outputDir, { recursive: true })

  const prisma = createMediaClient(requireEnv('PG_DATABASE_URL_MEDIA'))
  const summary = createSummary(args)
  const candidatesPath = path.join(args.outputDir, 'candidates.jsonl')
  const summaryPath = path.join(args.outputDir, 'summary.json')

  try {
    const candidateIds = await scanShortLinks(
      prisma,
      args,
      candidatesPath,
      summary
    )

    if (args.apply && candidateIds.length > 0) {
      summary.deleted = await deleteIds(
        prisma,
        candidateIds,
        args.deleteBatchSize
      )
    }
  } finally {
    await prisma.$disconnect()
  }

  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.info('')
  console.info('=== BAD MEDIA SHORTLINK DELETE ===')
  console.info(`mode: ${summary.mode}`)
  console.info(`host: ${summary.host}`)
  console.info(`extensions: ${summary.extensions.join(', ')}`)
  console.info(`domainHostname: ${summary.domainHostname ?? '(any)'}`)
  console.info(`redirectType: ${summary.redirectType ?? '(any)'}`)
  console.info(`requireBrightcoveId: ${summary.requireBrightcoveId}`)
  console.info(`scanned: ${summary.scanned}`)
  console.info(`candidates: ${summary.candidates}`)
  console.info(`deleted: ${summary.deleted}`)
  console.info(`summary: ${summaryPath}`)
  console.info(`candidates export: ${candidatesPath}`)
  console.info('')
  console.info('By target extension:')
  console.info(JSON.stringify(summary.byTargetExtension, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
