import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const BRIGHTCOVE_ACCOUNT_ID = process.env.BC_ACCOUNT_ID
const BRIGHTCOVE_CLIENT_ID = process.env.BC_CLIENT_ID
const BRIGHTCOVE_CLIENT_SECRET = process.env.BC_CLIENT_SECRET

const DEFAULT_PAGE_SIZE = 100
const DEFAULT_OUTPUT_PATH = 'apps/arclight/src/scripts/brightcove-content.csv'
const DEFAULT_CONCURRENCY = 8
const MAX_RETRIES = 5
const BASE_RETRY_DELAY_MS = 500

interface BrightcoveVideo {
  id: string
  reference_id?: string
  name?: string
  description?: string
  duration?: number
  state?: string
  created_at?: string
  updated_at?: string
  published_at?: string
  tags?: string[]
  custom_fields?: Record<string, string>
  sources?: Array<{
    src?: string
    type?: string
    container?: string
    avg_bitrate?: number
  }>
}

interface BrightcoveCountResponse {
  count: number
}

function requireEnv(name: string, value: string | undefined): string {
  if (value) return value
  throw new Error(`Missing required env var: ${name}`)
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return parsed
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms)
  })
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  let baseValue = ''
  if (typeof value === 'object') {
    baseValue = JSON.stringify(value) ?? ''
  } else if (typeof value === 'string') {
    baseValue = value
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    baseValue = `${value}`
  } else {
    baseValue = ''
  }
  const normalized = baseValue.replace(/\r\n|\r|\n/g, ' ').trim()
  const escaped = normalized.replace(/"/g, '""')
  return /[",]/.test(escaped) ? `"${escaped}"` : escaped
}

function buildCsv(
  videos: BrightcoveVideo[],
  options: { compact: boolean }
): string {
  const { compact } = options
  const headers = compact
    ? [
        'id',
        'referenceId',
        'name',
        'durationMs',
        'state',
        'createdAt',
        'updatedAt',
        'publishedAt'
      ]
    : [
        'id',
        'referenceId',
        'name',
        'durationMs',
        'state',
        'createdAt',
        'updatedAt',
        'publishedAt',
        'customFields',
        'description'
      ]

  const rows = videos.map((video) => {
    const row = compact
      ? [
          video.id,
          video.reference_id ?? '',
          video.name ?? '',
          video.duration ?? '',
          video.state ?? '',
          video.created_at ?? '',
          video.updated_at ?? '',
          video.published_at ?? ''
        ]
      : [
          video.id,
          video.reference_id ?? '',
          video.name ?? '',
          video.duration ?? '',
          video.state ?? '',
          video.created_at ?? '',
          video.updated_at ?? '',
          video.published_at ?? '',
          video.custom_fields ? JSON.stringify(video.custom_fields) : '',
          video.description ?? ''
        ]

    return row
      .map(csvEscape)
      .join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

async function fetchAccessToken(): Promise<string> {
  const clientId = requireEnv('BC_CLIENT_ID', BRIGHTCOVE_CLIENT_ID)
  const clientSecret = requireEnv('BC_CLIENT_SECRET', BRIGHTCOVE_CLIENT_SECRET)
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  )

  const tokenResponse = await fetch(
    'https://oauth.brightcove.com/v4/access_token',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    }
  )

  if (!tokenResponse.ok) {
    throw new Error(`Brightcove OAuth error: ${tokenResponse.status}`)
  }

  const tokenPayload: unknown = await tokenResponse.json()
  if (
    typeof tokenPayload !== 'object' ||
    tokenPayload === null ||
    !('access_token' in tokenPayload) ||
    typeof tokenPayload.access_token !== 'string'
  ) {
    throw new Error('Brightcove OAuth response missing access_token')
  }

  return tokenPayload.access_token
}

function getRetryDelayMs(attempt: number): number {
  return BASE_RETRY_DELAY_MS * Math.pow(2, attempt)
}

function shouldRetryStatus(status: number): boolean {
  return status === 429 || status >= 500
}

async function fetchVideosCount(params: {
  accountId: string
  getAccessToken: () => string
  refreshAccessToken: () => Promise<string>
}): Promise<number> {
  const { accountId, getAccessToken, refreshAccessToken } = params

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(
      `https://cms.api.brightcove.com/v1/accounts/${accountId}/counts/videos`,
      {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      }
    )

    if (response.ok) {
      const payload: unknown = await response.json()
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'count' in payload &&
        typeof (payload as BrightcoveCountResponse).count === 'number'
      ) {
        return (payload as BrightcoveCountResponse).count
      }

      throw new Error('Brightcove CMS count response missing numeric count')
    }

    if (response.status === 401) {
      await refreshAccessToken()
      continue
    }

    if (shouldRetryStatus(response.status) && attempt < MAX_RETRIES - 1) {
      await sleep(getRetryDelayMs(attempt))
      continue
    }

    throw new Error(`Brightcove CMS count error: ${response.status}`)
  }

  throw new Error('Brightcove CMS count failed after retries')
}

async function fetchVideosPage(params: {
  accountId: string
  offset: number
  limit: number
  getAccessToken: () => string
  refreshAccessToken: () => Promise<string>
}): Promise<BrightcoveVideo[]> {
  const { accountId, offset, limit, getAccessToken, refreshAccessToken } = params

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const videosResponse = await fetch(
      `https://cms.api.brightcove.com/v1/accounts/${accountId}/videos?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      }
    )

    if (videosResponse.ok) {
      const payload: unknown = await videosResponse.json()
      if (!Array.isArray(payload)) {
        throw new Error(`Brightcove CMS expected array at offset ${offset}`)
      }

      return payload as BrightcoveVideo[]
    }

    if (videosResponse.status === 401) {
      await refreshAccessToken()
      continue
    }

    if (
      shouldRetryStatus(videosResponse.status) &&
      attempt < MAX_RETRIES - 1
    ) {
      await sleep(getRetryDelayMs(attempt))
      continue
    }

    throw new Error(
      `Brightcove CMS videos error at offset ${offset}: ${videosResponse.status}`
    )
  }

  throw new Error(
    `Brightcove CMS videos failed after retries at offset ${offset}`
  )
}

async function main(): Promise<void> {
  const accountId = requireEnv('BC_ACCOUNT_ID', BRIGHTCOVE_ACCOUNT_ID)
  const outputPath =
    process.env.BC_EXPORT_OUTPUT_PATH?.trim() || DEFAULT_OUTPUT_PATH
  const concurrency = parsePositiveInt(
    process.env.BC_EXPORT_CONCURRENCY,
    DEFAULT_CONCURRENCY
  )
  const pageSize = parsePositiveInt(
    process.env.BC_EXPORT_PAGE_SIZE,
    DEFAULT_PAGE_SIZE
  )
  const compactMode = parseBoolean(process.env.BC_EXPORT_COMPACT)
  const gzipOutput = parseBoolean(process.env.BC_EXPORT_GZIP)

  let accessToken = await fetchAccessToken()
  let refreshPromise: Promise<string> | null = null

  const getAccessToken = (): string => accessToken
  const refreshAccessToken = async (): Promise<string> => {
    if (!refreshPromise) {
      refreshPromise = fetchAccessToken()
        .then((newToken) => {
          accessToken = newToken
          return newToken
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    return refreshPromise
  }

  const totalVideos = await fetchVideosCount({
    accountId,
    getAccessToken,
    refreshAccessToken
  })
  const offsets = Array.from(
    { length: Math.ceil(totalVideos / pageSize) },
    (_, index) => index * pageSize
  )
  const pageResults = new Map<number, BrightcoveVideo[]>()
  let finishedPages = 0

  console.log('=== Brightcove Content Export ===')
  console.log(`Account: ${accountId}`)
  console.log(`Output: ${outputPath}`)
  console.log(`Total videos: ${totalVideos}`)
  console.log(`Page size: ${pageSize}`)
  console.log(`Concurrency: ${concurrency}`)
  console.log(`Compact mode: ${compactMode ? 'on' : 'off'}`)
  console.log(`Gzip output: ${gzipOutput ? 'on' : 'off'}`)

  let nextOffsetIndex = 0
  const workerCount = Math.min(concurrency, offsets.length || 1)
  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = nextOffsetIndex
      nextOffsetIndex++
      if (currentIndex >= offsets.length) return

      const offset = offsets[currentIndex]
      const page = await fetchVideosPage({
        accountId,
        offset,
        limit: pageSize,
        getAccessToken,
        refreshAccessToken
      })

      pageResults.set(offset, page)
      finishedPages++

      if (finishedPages % 20 === 0 || finishedPages === offsets.length) {
        const fetchedCount = Array.from(pageResults.values()).reduce(
          (total, items) => total + items.length,
          0
        )
        console.log(
          `Fetched pages ${finishedPages}/${offsets.length} (${fetchedCount} videos)`
        )
      }
    }
  })

  await Promise.all(workers)

  const collectedVideos = offsets.flatMap(
    (offset) => pageResults.get(offset) ?? []
  )
  const csvContents = buildCsv(collectedVideos, { compact: compactMode })
  const resolvedOutputPath =
    gzipOutput && !outputPath.endsWith('.gz') ? `${outputPath}.gz` : outputPath
  const fileData = gzipOutput ? gzipSync(csvContents) : csvContents
  await writeFile(resolve(resolvedOutputPath), fileData)

  console.log(`Export complete. Wrote ${collectedVideos.length} rows.`)
  console.log(`Saved file: ${resolvedOutputPath}`)
}

if (require.main === module) {
  void main().catch((error) => {
    console.error('Export failed:', error)
    process.exitCode = 1
  })
}
