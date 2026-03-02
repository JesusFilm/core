import { PrismaClient } from '.prisma/api-languages-client'

const prisma = new PrismaClient()
const DEFAULT_CONCURRENCY = 15
const DEFAULT_TIMEOUT_MS = 15000
const PROGRESS_EVERY = 25

interface CliOptions {
  limit: number | null
  concurrency: number
  timeoutMs: number
}

interface AudioPreviewRow {
  languageId: string
  value: string
}

interface VerificationResult {
  languageId: string
  url: string
  ok: boolean
  status: number | null
  contentType: string
  error: string
}

function parsePositiveInt(name: string, value: string): number {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name} value: ${value}`)
  }
  return parsed
}

function parseCliOptions(argv: string[]): CliOptions {
  let limit: number | null = null
  let concurrency = DEFAULT_CONCURRENCY
  let timeoutMs = DEFAULT_TIMEOUT_MS

  for (const arg of argv) {
    if (arg.startsWith('--limit=')) {
      limit = parsePositiveInt('--limit', arg.slice('--limit='.length))
      continue
    }

    if (arg.startsWith('--concurrency=')) {
      concurrency = parsePositiveInt(
        '--concurrency',
        arg.slice('--concurrency='.length)
      )
      continue
    }

    if (arg.startsWith('--timeout-ms=')) {
      timeoutMs = parsePositiveInt(
        '--timeout-ms',
        arg.slice('--timeout-ms='.length)
      )
    }
  }

  return { limit, concurrency, timeoutMs }
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

async function verifyUrl(
  row: AudioPreviewRow,
  timeoutMs: number
): Promise<VerificationResult> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(row.value)
  } catch {
    return {
      languageId: row.languageId,
      url: row.value,
      ok: false,
      status: null,
      contentType: '',
      error: 'Invalid URL'
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(parsedUrl.toString(), {
      method: 'GET',
      headers: {
        Range: 'bytes=0-1'
      },
      signal: controller.signal
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isHttpOk = response.status >= 200 && response.status < 300
    const isExpectedStatus =
      response.status === 200 ||
      response.status === 206 ||
      response.status === 304
    const looksLikeAudio =
      contentType === '' ||
      contentType.startsWith('audio/') ||
      contentType.startsWith('application/octet-stream')

    const ok = isHttpOk && isExpectedStatus && looksLikeAudio

    return {
      languageId: row.languageId,
      url: row.value,
      ok,
      status: response.status,
      contentType,
      error: ok
        ? ''
        : `Unexpected response: status=${response.status}, contentType=${contentType || '<empty>'}`
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === 'AbortError'
          ? `Request timed out after ${timeoutMs}ms`
          : error.message
        : String(error)

    return {
      languageId: row.languageId,
      url: row.value,
      ok: false,
      status: null,
      contentType: '',
      error: message
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

async function runWithConcurrency<T>(
  items: AudioPreviewRow[],
  concurrency: number,
  worker: (item: AudioPreviewRow) => Promise<T>,
  onDone: (completed: number, result: T) => void
): Promise<T[]> {
  const results: T[] = new Array(items.length)
  let nextIndex = 0
  let completed = 0

  const runWorker = async (): Promise<void> => {
    while (true) {
      const currentIndex = nextIndex
      nextIndex++
      if (currentIndex >= items.length) return

      const result = await worker(items[currentIndex])
      results[currentIndex] = result
      completed++
      onDone(completed, result)
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runWorker()
  )

  await Promise.all(workers)
  return results
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2))

  console.log('AudioPreview URL verification starting...')
  console.log(`Database target: ${getDatabaseSummary()}`)
  console.log(`Concurrency: ${options.concurrency}`)
  console.log(`Timeout per URL: ${options.timeoutMs}ms`)
  if (options.limit != null) {
    console.log(`Limiting scan to first ${options.limit} row(s)`)
  }

  console.log('Loading AudioPreview rows from database...')
  const rows = await prisma.audioPreview.findMany({
    select: { languageId: true, value: true },
    orderBy: { languageId: 'asc' }
  })
  const rowsToProcess =
    options.limit == null ? rows : rows.slice(0, options.limit)
  console.log(`Loaded ${rowsToProcess.length} row(s) to verify`)

  let successCount = 0
  let failureCount = 0

  const results = await runWithConcurrency(
    rowsToProcess,
    options.concurrency,
    async (row) => verifyUrl(row, options.timeoutMs),
    (completed, result) => {
      if (result.ok) {
        successCount++
      } else {
        failureCount++
      }

      if (
        completed % PROGRESS_EVERY === 0 ||
        completed === rowsToProcess.length
      ) {
        console.log(
          `[Progress] ${completed}/${rowsToProcess.length} verified | ok=${successCount} | failed=${failureCount}`
        )
      }
    }
  )

  // We need a consistent way to count after all results resolve.
  const finalSuccessCount = results.filter((item) => item.ok).length
  const finalFailureCount = results.length - finalSuccessCount

  console.log('\n----- AudioPreview verification summary -----')
  console.log(`Total verified: ${results.length}`)
  console.log(`Passed: ${finalSuccessCount}`)
  console.log(`Failed: ${finalFailureCount}`)

  if (finalFailureCount > 0) {
    console.log('\nSample failures (up to 25):')
    const failures = results.filter((item) => !item.ok).slice(0, 25)
    for (const failure of failures) {
      console.log(
        `[${failure.languageId}] status=${failure.status ?? 'n/a'} error=${failure.error}`
      )
      console.log(`  ${failure.url}`)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('AudioPreview URL verification failed:', error)
    await prisma.$disconnect()
    process.exitCode = 1
  })
