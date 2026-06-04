import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { PrismaPg } from '@prisma/adapter-pg'
import fetch from 'node-fetch'

import { PrismaClient } from '../../libs/prisma/languages/src/__generated__/client/client'

type EnvFileMode = 'all' | 'languages' | 'r2'

interface EnvFileOption {
  path: string
  mode: EnvFileMode
}

interface Options {
  apply: boolean
  force: boolean
  envFiles: EnvFileOption[]
  outputDir: string
  limit?: number
  countryIds: string[]
}

interface CountryFlagRow {
  id: string
  flagPngSrc: string | null
  flagWebpSrc: string | null
}

interface FlagAsset {
  countryId: string
  field: 'flagPngSrc' | 'flagWebpSrc'
  sourceUrl: string
  key: string
  publicUrl: string
  contentType: string
}

interface UploadedAsset {
  key: string
  publicUrl: string
  contentType: string
  contentLength: number
  sourceUrl: string
  action: 'uploaded' | 'existing' | 'dryRun'
}

interface FailedAsset {
  key: string
  publicUrl: string
  sourceUrl: string
  error: string
}

const CLOUDFRONT_HOST_REGEX = /(^|\.)cloudfront\.net$/i
const DEFAULT_OUTPUT_DIR = '.cache/country-flag-r2-migration'

function parseArgs(): Options {
  const options: Options = {
    apply: false,
    force: false,
    envFiles: [],
    outputDir: DEFAULT_OUTPUT_DIR,
    countryIds: []
  }

  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i]
    const next = process.argv[i + 1]

    if (arg === '--apply') {
      options.apply = true
    } else if (arg === '--dry-run') {
      options.apply = false
    } else if (arg === '--force') {
      options.force = true
    } else if (arg === '--env-file' && next != null) {
      options.envFiles.push({ path: next, mode: 'all' })
      i += 1
    } else if (arg === '--languages-env-file' && next != null) {
      options.envFiles.push({ path: next, mode: 'languages' })
      i += 1
    } else if (arg === '--r2-env-file' && next != null) {
      options.envFiles.push({ path: next, mode: 'r2' })
      i += 1
    } else if (arg === '--output-dir' && next != null) {
      options.outputDir = next
      i += 1
    } else if (arg === '--limit' && next != null) {
      options.limit = Number(next)
      i += 1
    } else if (arg === '--country' && next != null) {
      options.countryIds.push(next.toUpperCase())
      i += 1
    }
  }

  return options
}

function shouldLoadEnvKey(key: string, mode: EnvFileMode): boolean {
  if (mode === 'all') return true
  if (mode === 'languages') return key === 'PG_DATABASE_URL_LANGUAGES'
  return key.startsWith('CLOUDFLARE_R2_')
}

async function loadEnvFile(envFile: EnvFileOption): Promise<void> {
  const contents = await readFile(envFile.path, 'utf8')

  for (const line of contents.split('\n')) {
    if (line.trim() === '' || line.startsWith('#')) continue

    const equalsIndex = line.indexOf('=')
    if (equalsIndex === -1) continue

    const key = line.slice(0, equalsIndex)
    if (!shouldLoadEnvKey(key, envFile.mode)) continue

    const value = line.slice(equalsIndex + 1)
    process.env[key] = value
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') throw new Error(`Missing ${name}`)
  return value
}

function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: requireEnv('CLOUDFLARE_R2_ENDPOINT'),
    credentials: {
      accessKeyId: requireEnv('CLOUDFLARE_R2_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('CLOUDFLARE_R2_SECRET')
    }
  })
}

function normalizeCustomDomain(): string {
  return requireEnv('CLOUDFLARE_R2_CUSTOM_DOMAIN').replace(/\/+$/, '')
}

function contentTypeForKey(key: string): string {
  const extension = path.extname(key).toLowerCase()

  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'

  return 'application/octet-stream'
}

function toFlagAsset(
  countryId: string,
  field: FlagAsset['field'],
  value: string | null
): FlagAsset | null {
  if (value == null || value === '') return null

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  if (!CLOUDFRONT_HOST_REGEX.test(url.hostname)) return null
  if (!url.pathname.startsWith('/flags/')) return null

  const key = decodeURIComponent(url.pathname.replace(/^\/+/, ''))
  const publicUrl = `${normalizeCustomDomain()}/${key}`

  return {
    countryId,
    field,
    sourceUrl: value,
    key,
    publicUrl,
    contentType: contentTypeForKey(key)
  }
}

async function objectExists(
  client: S3Client,
  key: string
): Promise<{ exists: boolean; contentLength: number }> {
  try {
    const head = await client.send(
      new HeadObjectCommand({
        Bucket: requireEnv('CLOUDFLARE_R2_BUCKET'),
        Key: key
      })
    )

    return { exists: true, contentLength: head.ContentLength ?? 0 }
  } catch (error) {
    const statusCode =
      typeof error === 'object' &&
      error != null &&
      '$metadata' in error &&
      typeof error.$metadata === 'object' &&
      error.$metadata != null &&
      'httpStatusCode' in error.$metadata
        ? error.$metadata.httpStatusCode
        : undefined

    if (statusCode === 404) return { exists: false, contentLength: 0 }

    throw error
  }
}

async function uploadAsset(
  client: S3Client,
  asset: FlagAsset,
  options: Options
): Promise<UploadedAsset> {
  const existing = await objectExists(client, asset.key)
  if (existing.exists && !options.force) {
    return {
      key: asset.key,
      publicUrl: asset.publicUrl,
      contentType: asset.contentType,
      contentLength: existing.contentLength,
      sourceUrl: asset.sourceUrl,
      action: options.apply ? 'existing' : 'dryRun'
    }
  }

  if (!options.apply) {
    return {
      key: asset.key,
      publicUrl: asset.publicUrl,
      contentType: asset.contentType,
      contentLength: existing.contentLength,
      sourceUrl: asset.sourceUrl,
      action: 'dryRun'
    }
  }

  const response = await fetch(asset.sourceUrl)
  if (!response.ok) {
    throw new Error(
      `Failed to download ${asset.sourceUrl}: ${response.status} ${response.statusText}`
    )
  }

  const body = Buffer.from(await response.arrayBuffer())
  if (body.length === 0) throw new Error(`Downloaded empty file: ${asset.key}`)

  await client.send(
    new PutObjectCommand({
      Bucket: requireEnv('CLOUDFLARE_R2_BUCKET'),
      Key: asset.key,
      Body: body,
      ContentType: asset.contentType,
      ContentLength: body.length
    })
  )

  const head = await objectExists(client, asset.key)
  if (!head.exists || head.contentLength === 0) {
    throw new Error(`R2 stored object is missing or empty: ${asset.key}`)
  }

  return {
    key: asset.key,
    publicUrl: asset.publicUrl,
    contentType: asset.contentType,
    contentLength: head.contentLength,
    sourceUrl: asset.sourceUrl,
    action: 'uploaded'
  }
}

async function getCountries(
  prisma: PrismaClient,
  options: Options
): Promise<CountryFlagRow[]> {
  const countryFilter =
    options.countryIds.length > 0
      ? `and id = any($1)`
      : ''
  const limit = options.limit != null ? `limit ${options.limit}` : ''
  const values = options.countryIds.length > 0 ? [options.countryIds] : []

  return await prisma.$queryRawUnsafe<CountryFlagRow[]>(
    `
      select id, "flagPngSrc", "flagWebpSrc"
      from public."Country"
      where (
        coalesce("flagPngSrc", '') ~* 'https?://[^/]*cloudfront\\.net/flags/'
        or coalesce("flagWebpSrc", '') ~* 'https?://[^/]*cloudfront\\.net/flags/'
      )
      ${countryFilter}
      order by id asc
      ${limit}
    `,
    ...values
  )
}

async function updateCountryFlags(
  prisma: PrismaClient,
  countryId: string,
  updates: Partial<Pick<CountryFlagRow, 'flagPngSrc' | 'flagWebpSrc'>>
): Promise<void> {
  await prisma.country.update({
    where: { id: countryId },
    data: updates
  })
}

async function main(): Promise<void> {
  const options = parseArgs()

  for (const envFile of options.envFiles) {
    await loadEnvFile(envFile)
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: requireEnv('PG_DATABASE_URL_LANGUAGES'),
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000
    })
  })
  const r2Client = getR2Client()

  const generatedAt = new Date().toISOString()
  const runDir = path.join(
    options.outputDir,
    generatedAt.replace(/[:.]/g, '-')
  )
  await mkdir(runDir, { recursive: true })

  const uploadedByKey = new Map<string, UploadedAsset>()
  const failures: FailedAsset[] = []
  const plannedUpdates: Array<{
    countryId: string
    updates: Partial<Pick<CountryFlagRow, 'flagPngSrc' | 'flagWebpSrc'>>
  }> = []

  try {
    const countries = await getCountries(prisma, options)
    const assets = countries.flatMap((country) =>
      [
        toFlagAsset(country.id, 'flagPngSrc', country.flagPngSrc),
        toFlagAsset(country.id, 'flagWebpSrc', country.flagWebpSrc)
      ].filter((asset): asset is FlagAsset => asset != null)
    )
    const uniqueAssets = Array.from(
      new Map(assets.map((asset) => [asset.key, asset])).values()
    )

    console.info('=== COUNTRY FLAG R2 MIGRATION ===')
    console.info(`mode: ${options.apply ? 'apply' : 'dry-run'}`)
    console.info(`countries with CloudFront flags: ${countries.length}`)
    console.info(`flag URL refs: ${assets.length}`)
    console.info(`unique R2 keys: ${uniqueAssets.length}`)

    for (const asset of uniqueAssets) {
      try {
        const uploaded = await uploadAsset(r2Client, asset, options)
        uploadedByKey.set(asset.key, uploaded)
        console.info(`${uploaded.action}: ${asset.key}`)
      } catch (error) {
        failures.push({
          key: asset.key,
          publicUrl: asset.publicUrl,
          sourceUrl: asset.sourceUrl,
          error: error instanceof Error ? error.message : String(error)
        })
        console.error(`failed: ${asset.key}`)
      }
    }

    for (const country of countries) {
      const updates: Partial<
        Pick<CountryFlagRow, 'flagPngSrc' | 'flagWebpSrc'>
      > = {}

      for (const field of ['flagPngSrc', 'flagWebpSrc'] as const) {
        const asset = toFlagAsset(country.id, field, country[field])
        if (asset == null) continue
        if (!uploadedByKey.has(asset.key)) continue

        updates[field] = asset.publicUrl
      }

      if (Object.keys(updates).length === 0) continue

      plannedUpdates.push({ countryId: country.id, updates })

      if (options.apply) {
        await updateCountryFlags(prisma, country.id, updates)
      }
    }

    const summary = {
      generatedAt,
      mode: options.apply ? 'apply' : 'dry-run',
      force: options.force,
      countriesScanned: countries.length,
      flagRefs: assets.length,
      uniqueKeys: uniqueAssets.length,
      uploaded: Array.from(uploadedByKey.values()).filter(
        ({ action }) => action === 'uploaded'
      ).length,
      existing: Array.from(uploadedByKey.values()).filter(
        ({ action }) => action === 'existing'
      ).length,
      dryRunReady: Array.from(uploadedByKey.values()).filter(
        ({ action }) => action === 'dryRun'
      ).length,
      failed: failures.length,
      countryUpdates: plannedUpdates.length,
      uploadedAssets: Array.from(uploadedByKey.values()),
      failures,
      plannedUpdates
    }

    const outputPath = path.join(runDir, 'summary.json')
    await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`)

    console.info(`failed: ${failures.length}`)
    console.info(`country updates: ${plannedUpdates.length}`)
    console.info(`JSON artifact: ${outputPath}`)

    if (failures.length > 0) process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
