import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { PrismaClient } from '.prisma/api-languages-client'

const prisma = new PrismaClient()

const DEFAULT_PUBLIC_BASE_URL = 'https://api-media-core.jesusfilm.org'
const LEGACY_CLOUDFRONT_HOST = 'd2y2gzgc06w0mw.cloudfront.net'
const R2_HOST_SUFFIX = '.r2.cloudflarestorage.com'
const DEFAULT_CONTENT_TYPE = 'audio/aac'
const PROGRESS_EVERY = 25

interface R2Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
}

interface MigrationPlan {
  nextValue: string | null
  reason:
    | 'already_target'
    | 'updated'
    | 'unrecognized_url'
    | 'unrecognized_host'
    | 'language_mismatch'
  sourceType: 'cloudfront' | 'legacy_r2' | 'none'
}

interface CliOptions {
  apply: boolean
  limit: number | null
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function getTargetBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.AUDIO_PREVIEW_PUBLIC_BASE_URL ?? DEFAULT_PUBLIC_BASE_URL
  )
}

function getDatabaseSummary(): string {
  const rawUrl = process.env.PG_DATABASE_URL_LANGUAGES?.trim()
  if (!rawUrl) {
    return 'PG_DATABASE_URL_LANGUAGES not set'
  }

  try {
    const parsed = new URL(rawUrl)
    const databaseName = parsed.pathname.replace(/^\//, '') || '<unknown>'
    const port = parsed.port || '5432'
    return `${parsed.hostname}:${port}/${databaseName}`
  } catch {
    return 'PG_DATABASE_URL_LANGUAGES is set but not a valid URL'
  }
}

function extractLanguageIdFromLegacyPath(pathname: string): string | null {
  const outputMatch = pathname.match(/^\/output\/([^.]+)\.aac$/)
  if (outputMatch) return outputMatch[1]

  const audioPreviewMatch = pathname.match(/^\/audiopreview\/([^.]+)\.aac$/)
  if (audioPreviewMatch) return audioPreviewMatch[1]

  return null
}

function buildTargetUrl(baseUrl: string, languageId: string): string {
  return `${baseUrl}/audiopreview/${encodeURIComponent(languageId)}.aac`
}

function parseCliOptions(argv: string[]): CliOptions {
  const apply = argv.includes('--apply')
  let limit: number | null = null

  for (const arg of argv) {
    if (arg.startsWith('--limit=')) {
      const value = Number.parseInt(arg.slice('--limit='.length).trim(), 10)
      if (Number.isNaN(value) || value <= 0) {
        throw new Error('Invalid --limit value. Use a positive integer.')
      }
      limit = value
    }
  }

  return { apply, limit }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing ${name}`)
  }
  return value
}

function getR2Config(): R2Config {
  const secretAccessKey =
    process.env.CLOUDFLARE_R2_SECRET?.trim() ||
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim()

  if (!secretAccessKey) {
    throw new Error(
      'Missing CLOUDFLARE_R2_SECRET or CLOUDFLARE_R2_SECRET_ACCESS_KEY'
    )
  }

  return {
    endpoint: getRequiredEnv('CLOUDFLARE_R2_ENDPOINT'),
    accessKeyId: getRequiredEnv('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    secretAccessKey,
    bucket: getRequiredEnv('CLOUDFLARE_R2_BUCKET')
  }
}

function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  })
}

async function uploadCloudfrontAudioToR2(params: {
  client: S3Client
  bucket: string
  sourceUrl: string
  targetKey: string
}): Promise<void> {
  const response = await fetch(params.sourceUrl)
  if (!response.ok) {
    throw new Error(
      `CloudFront download failed (${response.status} ${response.statusText})`
    )
  }

  const contentType =
    response.headers.get('content-type')?.split(';')[0] ?? DEFAULT_CONTENT_TYPE
  const bytes = Buffer.from(await response.arrayBuffer())

  await params.client.send(
    new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.targetKey,
      Body: bytes,
      ContentType: contentType
    })
  )
}

function getMigrationPlan(
  currentValue: string,
  rowLanguageId: string,
  targetBaseUrl: string
): MigrationPlan {
  let url: URL
  try {
    url = new URL(currentValue)
  } catch {
    return { nextValue: null, reason: 'unrecognized_url', sourceType: 'none' }
  }

  const extractedLanguageId = extractLanguageIdFromLegacyPath(url.pathname)
  if (!extractedLanguageId) {
    return { nextValue: null, reason: 'unrecognized_url', sourceType: 'none' }
  }

  if (extractedLanguageId !== rowLanguageId) {
    return { nextValue: null, reason: 'language_mismatch', sourceType: 'none' }
  }

  const isLegacyCloudfront = url.hostname === LEGACY_CLOUDFRONT_HOST
  const isLegacyR2 = url.hostname.endsWith(R2_HOST_SUFFIX)
  const isAlreadyTarget =
    normalizeBaseUrl(`${url.protocol}//${url.host}`) === targetBaseUrl &&
    url.pathname === `/audiopreview/${rowLanguageId}.aac`

  if (isAlreadyTarget) {
    return { nextValue: null, reason: 'already_target', sourceType: 'none' }
  }

  if (!isLegacyCloudfront && !isLegacyR2) {
    return { nextValue: null, reason: 'unrecognized_host', sourceType: 'none' }
  }

  return {
    nextValue: buildTargetUrl(targetBaseUrl, rowLanguageId),
    reason: 'updated',
    sourceType: isLegacyCloudfront ? 'cloudfront' : 'legacy_r2'
  }
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2))
  const shouldApply = options.apply
  const targetBaseUrl = getTargetBaseUrl()
  const r2Config = shouldApply ? getR2Config() : null

  console.log(`Target base URL: ${targetBaseUrl}`)
  console.log(
    shouldApply
      ? 'Mode: APPLY (database writes enabled)'
      : 'Mode: DRY RUN (no writes; use --apply to persist changes)'
  )
  if (r2Config) {
    console.log(
      `R2 target: bucket=${r2Config.bucket}, endpoint=${r2Config.endpoint}`
    )
  }
  console.log(`Database target: ${getDatabaseSummary()}`)
  if (options.limit != null) {
    console.log(`Limiting scan to first ${options.limit} row(s)`)
  }

  console.log('Loading AudioPreview rows from database...')
  const rows = await prisma.audioPreview.findMany({
    select: {
      languageId: true,
      value: true
    },
    orderBy: { languageId: 'asc' }
  })

  const rowsToProcess =
    options.limit != null ? rows.slice(0, options.limit) : rows
  console.log(`Loaded ${rowsToProcess.length} row(s) to process`)

  let updated = 0
  let alreadyTarget = 0
  let unrecognizedUrl = 0
  let unrecognizedHost = 0
  let languageMismatch = 0
  let copiedFromCloudfront = 0
  let uploadFailures = 0

  const examples: Array<{ languageId: string; from: string; to: string }> = []
  const r2Client = r2Config ? createR2Client(r2Config) : null

  let processed = 0
  const maybeLogProgress = (): void => {
    if (
      processed % PROGRESS_EVERY === 0 ||
      processed === rowsToProcess.length
    ) {
      console.log(
        `[Progress] ${processed}/${rowsToProcess.length} processed | updated=${updated} | uploaded=${copiedFromCloudfront} | uploadFailures=${uploadFailures}`
      )
    }
  }

  for (const row of rowsToProcess) {
    processed++
    const result = getMigrationPlan(row.value, row.languageId, targetBaseUrl)

    if (result.reason === 'already_target') {
      alreadyTarget++
      maybeLogProgress()
      continue
    }

    if (result.reason === 'unrecognized_url') {
      unrecognizedUrl++
      maybeLogProgress()
      continue
    }

    if (result.reason === 'unrecognized_host') {
      unrecognizedHost++
      maybeLogProgress()
      continue
    }

    if (result.reason === 'language_mismatch') {
      languageMismatch++
      console.warn(
        `[SKIP] language mismatch for ${row.languageId}: ${row.value}`
      )
      maybeLogProgress()
      continue
    }

    if (!result.nextValue) continue

    if (examples.length < 10) {
      examples.push({
        languageId: row.languageId,
        from: row.value,
        to: result.nextValue
      })
    }

    if (shouldApply) {
      if (r2Client == null || r2Config == null) {
        throw new Error('R2 client is not initialized')
      }

      const targetKey = `audiopreview/${row.languageId}.aac`

      if (result.sourceType === 'cloudfront') {
        console.log(
          `[Upload] ${processed}/${rowsToProcess.length} languageId=${row.languageId} source=cloudfront key=${targetKey}`
        )
        try {
          await uploadCloudfrontAudioToR2({
            client: r2Client,
            bucket: r2Config.bucket,
            sourceUrl: row.value,
            targetKey
          })
          copiedFromCloudfront++
        } catch (error) {
          uploadFailures++
          console.error(
            `[SKIP] upload failed for ${row.languageId} (${row.value}):`,
            error
          )
          continue
        }
      }

      await prisma.audioPreview.update({
        where: { languageId: row.languageId },
        data: {
          value: result.nextValue,
          updatedAt: new Date()
        }
      })
    }

    updated++
    maybeLogProgress()
  }

  console.log('\n----- AudioPreview URL migration summary -----')
  console.log(`Total rows scanned: ${rowsToProcess.length}`)
  console.log(`Rows updated${shouldApply ? '' : ' (would update)'}: ${updated}`)
  console.log(`Already on target URL: ${alreadyTarget}`)
  console.log(`Skipped (unrecognized URL format): ${unrecognizedUrl}`)
  console.log(`Skipped (unrecognized host): ${unrecognizedHost}`)
  console.log(`Skipped (language/path mismatch): ${languageMismatch}`)
  if (shouldApply) {
    console.log(`Copied from CloudFront to R2: ${copiedFromCloudfront}`)
    console.log(`Skipped due to upload failures: ${uploadFailures}`)
  }

  if (examples.length > 0) {
    console.log('\nExamples:')
    for (const example of examples) {
      console.log(`[${example.languageId}]`)
      console.log(`  from: ${example.from}`)
      console.log(`  to:   ${example.to}`)
    }
  }
}

main()
  .catch((error) => {
    console.error('AudioPreview URL migration failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
