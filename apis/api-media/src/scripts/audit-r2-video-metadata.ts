import { execFile } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const DEFAULT_INPUT_CSV = 'apis/api-media/src/scripts/retry-mux-export.csv'
const DEFAULT_OUTPUT_CSV =
  'apis/api-media/src/scripts/retry-mux-issues-audit.csv'
const DEFAULT_CONCURRENCY = 4
const DEFAULT_FLUSH_EVERY = 25

interface IssueRow {
  videoId: string
  languageId: string
  edition: string
  version: string
  reason: string
  r2AssetId: string
  r2PublicUrl: string
  originalFilename: string
}

interface AuditResult extends IssueRow {
  status: 'ok' | 'warn' | 'fail' | 'error'
  flags: string
  formatDurationSec: string
  videoDurationSec: string
  audioDurationSec: string
  durationRatio: string
  ffprobeError: string
}

interface FfprobeStream {
  codec_type?: string
  duration?: string
  duration_ts?: number
  time_base?: string
}

interface FfprobeFormat {
  duration?: string
}

interface FfprobeOutput {
  streams?: FfprobeStream[]
  format?: FfprobeFormat
}

function parseStringArg(args: string[], key: string): string | undefined {
  const arg = args.find((value) => value.startsWith(`${key}=`))
  if (!arg) return undefined
  const value = arg.slice(key.length + 1).trim()
  return value.length > 0 ? value : undefined
}

function parseNumberArg(args: string[], key: string, fallback: number): number {
  const raw = parseStringArg(args, key)
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

function csvEscape(
  value: string | number | boolean | null | undefined
): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
    .replace(/\r\n|\r|\n/g, ' ')
    .trim()
  const escaped = stringValue.replace(/"/g, '""')
  return /[",]/.test(stringValue) ? `"${escaped}"` : escaped
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      const nextChar = line[i + 1]
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }
    current += char
  }

  values.push(current)
  return values
}

function parseCsv(contents: string): IssueRow[] {
  const lines = contents.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length <= 1) return []

  const header = parseCsvLine(lines[0])
  const columnIndex = new Map<string, number>()
  for (let i = 0; i < header.length; i++) {
    columnIndex.set(header[i], i)
  }

  const get = (row: string[], key: string): string =>
    row[columnIndex.get(key) ?? -1] ?? ''

  const rows: IssueRow[] = []
  for (const line of lines.slice(1)) {
    const row = parseCsvLine(line)
    const r2PublicUrl = get(row, 'r2PublicUrl')
    if (!r2PublicUrl) continue
    rows.push({
      videoId: get(row, 'videoId'),
      languageId: get(row, 'languageId'),
      edition: get(row, 'edition'),
      version: get(row, 'version'),
      reason: get(row, 'reason'),
      r2AssetId: get(row, 'r2AssetId'),
      r2PublicUrl,
      originalFilename: get(row, 'originalFilename')
    })
  }

  return rows
}

function buildCsv(rows: AuditResult[]): string {
  const header = [
    'videoId',
    'languageId',
    'edition',
    'version',
    'reason',
    'r2AssetId',
    'r2PublicUrl',
    'originalFilename',
    'status',
    'flags',
    'formatDurationSec',
    'videoDurationSec',
    'audioDurationSec',
    'durationRatio',
    'ffprobeError'
  ]

  const body = rows.map((row) =>
    [
      row.videoId,
      row.languageId,
      row.edition,
      row.version,
      row.reason,
      row.r2AssetId,
      row.r2PublicUrl,
      row.originalFilename,
      row.status,
      row.flags,
      row.formatDurationSec,
      row.videoDurationSec,
      row.audioDurationSec,
      row.durationRatio,
      row.ffprobeError
    ]
      .map(csvEscape)
      .join(',')
  )

  return [header.join(','), ...body].join('\n')
}

function parseRational(value?: string): number | null {
  if (!value || !value.includes('/')) return null
  const [n, d] = value.split('/')
  const numerator = Number.parseFloat(n)
  const denominator = Number.parseFloat(d)
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return null
  }
  return numerator / denominator
}

function streamDurationSeconds(stream: FfprobeStream): number | null {
  if (stream.duration) {
    const parsed = Number.parseFloat(stream.duration)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }

  if (stream.duration_ts != null && stream.time_base) {
    const timeBase = parseRational(stream.time_base)
    if (timeBase != null) {
      const computed = stream.duration_ts * timeBase
      if (Number.isFinite(computed) && computed > 0) return computed
    }
  }

  return null
}

function formatNumber(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return ''
  return value.toFixed(3)
}

async function ffprobeUrl(url: string): Promise<FfprobeOutput> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    url
  ])
  return JSON.parse(stdout) as FfprobeOutput
}

function buildFlags(
  formatDuration: number | null,
  videoDuration: number | null,
  audioDuration: number | null,
  hasVideoStream: boolean
): { status: 'ok' | 'warn' | 'fail'; flags: string; ratio: string } {
  const flags: string[] = []

  if (!hasVideoStream) {
    flags.push('missing_video_stream')
    return { status: 'fail', flags: flags.join(';'), ratio: '' }
  }

  if (formatDuration == null || videoDuration == null || videoDuration <= 0) {
    flags.push('missing_duration')
    return { status: 'warn', flags: flags.join(';'), ratio: '' }
  }

  const ratio = formatDuration / videoDuration
  const ratioString = Number.isFinite(ratio) ? ratio.toFixed(3) : ''

  if (ratio >= 3) flags.push('container_video_ratio_ge_3')
  if (formatDuration >= 1800 && videoDuration <= 120) {
    flags.push('long_container_short_video')
  }

  if (audioDuration != null && videoDuration > 0) {
    const audioRatio = audioDuration / videoDuration
    if (audioRatio >= 3) flags.push('audio_video_ratio_ge_3')
  }

  if (flags.length === 0) {
    return { status: 'ok', flags: '', ratio: ratioString }
  }

  const hardFail =
    flags.includes('long_container_short_video') ||
    flags.includes('container_video_ratio_ge_3')
  return {
    status: hardFail ? 'fail' : 'warn',
    flags: flags.join(';'),
    ratio: ratioString
  }
}

async function auditRow(row: IssueRow): Promise<AuditResult> {
  try {
    const probe = await ffprobeUrl(row.r2PublicUrl)
    const streams = probe.streams ?? []
    const videoStreams = streams.filter((s) => s.codec_type === 'video')
    const audioStreams = streams.filter((s) => s.codec_type === 'audio')

    const formatDurationRaw = probe.format?.duration
    const formatDuration = formatDurationRaw
      ? Number.parseFloat(formatDurationRaw)
      : null

    const videoDuration =
      videoStreams
        .map(streamDurationSeconds)
        .find((v) => v != null && Number.isFinite(v)) ?? null

    const audioDurationCandidates = audioStreams
      .map(streamDurationSeconds)
      .filter((v): v is number => v != null && Number.isFinite(v))
    const audioDuration =
      audioDurationCandidates.length > 0
        ? Math.max(...audioDurationCandidates)
        : null

    const { status, flags, ratio } = buildFlags(
      formatDuration,
      videoDuration,
      audioDuration,
      videoStreams.length > 0
    )

    return {
      ...row,
      status,
      flags,
      formatDurationSec: formatNumber(formatDuration),
      videoDurationSec: formatNumber(videoDuration),
      audioDurationSec: formatNumber(audioDuration),
      durationRatio: ratio,
      ffprobeError: ''
    }
  } catch (error) {
    return {
      ...row,
      status: 'error',
      flags: 'ffprobe_failed',
      formatDurationSec: '',
      videoDurationSec: '',
      audioDurationSec: '',
      durationRatio: '',
      ffprobeError: (error as Error).message.replace(/\r\n|\r|\n/g, ' ')
    }
  }
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
  onProgress: (done: number, partialResults: Array<R | undefined>) => Promise<void>
): Promise<R[]> {
  const results: Array<R | undefined> = new Array(items.length)
  let nextIndex = 0
  let done = 0

  const runners = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length || 1)) },
    async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex++
        results[currentIndex] = await worker(items[currentIndex], currentIndex)
        done++
        await onProgress(done, results)
      }
    }
  )

  await Promise.all(runners)
  return results.filter((item): item is R => item !== undefined)
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const inputPath = parseStringArg(args, '--input') ?? DEFAULT_INPUT_CSV
  const outputPath = parseStringArg(args, '--output') ?? DEFAULT_OUTPUT_CSV
  const concurrency = parseNumberArg(args, '--concurrency', DEFAULT_CONCURRENCY)

  const inputContents = await readFile(inputPath, 'utf8')
  const rows = parseCsv(inputContents)

  console.log('=== Audit R2 Video Metadata ===')
  console.log(`Input: ${inputPath}`)
  console.log(`Output: ${outputPath}`)
  console.log(`Rows: ${rows.length}`)
  console.log(`Concurrency: ${concurrency}`)

  const results = await runWithConcurrency(
    rows,
    concurrency,
    async (row) => auditRow(row),
    async (done, partialResults) => {
      if (done % DEFAULT_FLUSH_EVERY === 0 || done === rows.length) {
        const flushedRows = partialResults.filter(
          (row): row is AuditResult => row !== undefined
        )
        await writeFile(
          outputPath,
          buildCsv(flushedRows),
          'utf8'
        )
        console.log(`Processed ${done}/${rows.length}`)
      }
    }
  )

  await writeFile(outputPath, buildCsv(results), 'utf8')

  const counts = results.reduce(
    (acc, row) => {
      acc[row.status]++
      return acc
    },
    { ok: 0, warn: 0, fail: 0, error: 0 }
  )

  console.log('\nAudit complete.')
  console.log(`ok: ${counts.ok}`)
  console.log(`warn: ${counts.warn}`)
  console.log(`fail: ${counts.fail}`)
  console.log(`error: ${counts.error}`)
}

if (require.main === module) {
  void main().catch((error) => {
    console.error('Audit failed:', error)
    process.exitCode = 1
  })
}
