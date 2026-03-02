import { Redis } from 'ioredis'

interface CliOptions {
  url: string
  apply: boolean
}

function parseCliOptions(argv: string[]): CliOptions {
  let url = ''
  let apply = false

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--apply') {
      apply = true
      continue
    }
    if (arg === '--url') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('Missing value for --url')
      }
      url = value.trim()
      index += 1
      continue
    }
    if (arg.startsWith('--url=')) {
      url = arg.slice('--url='.length).trim()
      continue
    }
  }

  if (!url) {
    throw new Error(
      'Missing --url. Example: --url="https://api.arclight.org/v2/media-languages?page=1&limit=10&metadataLanguageTags=en"'
    )
  }

  return { url, apply }
}

function parseListParam(searchParams: URLSearchParams, name: string): string[] | undefined {
  const raw = searchParams.get(name)
  if (raw == null) return undefined
  const values = raw.split(',').map((value) => value.trim()).filter(Boolean)
  return values.length > 0 ? values : undefined
}

function generateCacheKey(parts: (string | number)[]): string {
  return parts.join(':')
}

function buildMediaLanguagesCacheKey(inputUrl: string): string {
  const parsedUrl = new URL(inputUrl)
  const searchParams = parsedUrl.searchParams

  const pageRaw = searchParams.get('page')
  const limitRaw = searchParams.get('limit')
  const page = pageRaw == null ? 1 : Number(pageRaw)
  const limit = limitRaw == null ? 10 : Number(limitRaw)

  if (!Number.isFinite(page) || page < 1) {
    throw new Error(`Invalid page value: "${pageRaw}"`)
  }
  if (!Number.isFinite(limit) || limit < 1) {
    throw new Error(`Invalid limit value: "${limitRaw}"`)
  }

  const ids = parseListParam(searchParams, 'ids')
  const bcp47 = parseListParam(searchParams, 'bcp47')
  const iso3 = parseListParam(searchParams, 'iso3')
  const term = searchParams.get('term')
  const metadataLanguageTags =
    parseListParam(searchParams, 'metadataLanguageTags') ?? []

  return generateCacheKey([
    'media-languages',
    page.toString(),
    limit.toString(),
    ...(ids ?? []).slice(0, 20),
    ...(bcp47 ?? []).slice(0, 20),
    ...(iso3 ?? []).slice(0, 20),
    term ?? '',
    ...metadataLanguageTags
  ])
}

function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL?.trim()
  const redisPort = process.env.REDIS_PORT?.trim()

  if (redisUrl != null && redisUrl.includes('://')) {
    return new Redis(redisUrl, {
      connectTimeout: 5000,
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      retryStrategy(times: number) {
        if (times > 3) return null
        return Math.min(times * 200, 1000)
      }
    })
  }

  return new Redis({
    host: redisUrl || 'redis',
    port: redisPort != null ? Number(redisPort) : 6379,
    connectTimeout: 5000,
    maxRetriesPerRequest: 2,
    lazyConnect: true,
    retryStrategy(times: number) {
      if (times > 3) return null
      return Math.min(times * 200, 1000)
    }
  })
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2))
  const cacheKey = buildMediaLanguagesCacheKey(options.url)
  const staleKey = `${cacheKey}:stale`

  console.log(`Input URL: ${options.url}`)
  console.log(`Fresh key: ${cacheKey}`)
  console.log(`Stale key: ${staleKey}`)

  const redis = createRedisClient()
  redis.on('error', () => {
    // The command flow below surfaces connection failures with a cleaner message.
  })

  try {
    await redis.connect()
    await redis.ping()

    const freshExists = await redis.exists(cacheKey)
    const staleExists = await redis.exists(staleKey)

    console.log(`Fresh key exists: ${freshExists === 1 ? 'yes' : 'no'}`)
    console.log(`Stale key exists: ${staleExists === 1 ? 'yes' : 'no'}`)

    if (!options.apply) {
      console.log('Dry run mode. Re-run with --apply to delete only the fresh key.')
      return
    }

    const deletedCount = await redis.del(cacheKey)
    console.log(`Deleted fresh key count: ${deletedCount}`)
    console.log('Done. Stale key was not deleted.')
  } finally {
    if (redis.status === 'ready' || redis.status === 'connect') {
      await redis.quit()
    } else {
      redis.disconnect()
    }
  }
}

void main().catch((error: unknown) => {
  const rawMessage = error instanceof Error ? error.message : String(error)
  const normalizedMessage = rawMessage.toLowerCase()
  const isConnectionFailure =
    normalizedMessage.includes('max retries per request') ||
    normalizedMessage.includes('connect') ||
    normalizedMessage.includes('econn') ||
    normalizedMessage.includes('timeout') ||
    normalizedMessage.includes('enotfound')

  if (isConnectionFailure) {
    console.error('Failed to stale media-languages cache key: unable to connect to Redis.')
    console.error(
      'Check REDIS_URL/REDIS_PORT and ensure your network can reach the production Redis endpoint (VPN/bastion/SSM tunnel may be required).'
    )
  } else {
    console.error(`Failed to stale media-languages cache key: ${rawMessage}`)
  }
  process.exitCode = 1
})
