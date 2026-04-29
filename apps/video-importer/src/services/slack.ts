import type { ProcessingSummary } from '../types'
import { parseImporterFilenameForTable } from '../utils/importerFilenameDisplay'

const SLACK_CHAT_POST_MESSAGE = 'https://slack.com/api/chat.postMessage'

/** Slack Block Kit payloads (subset we use). */
type SlackMrkdwn = { type: 'mrkdwn'; text: string }

type SlackBlock =
  | {
      type: 'header'
      text: { type: 'plain_text'; text: string; emoji?: boolean }
    }
  | { type: 'divider' }
  | {
      type: 'section'
      text?: SlackMrkdwn
      fields?: SlackMrkdwn[]
    }
  | {
      type: 'context'
      elements: SlackMrkdwn[]
    }

const MRKDWN_SECTION_BUDGET = 2800
const FOLDER_PATH_MAX = 200
// Slack messages are capped at 50 blocks. Reserve room for header, summary,
// context, and the truncation notice; cap table sections accordingly.
const MAX_TABLE_SECTIONS = 45
const SLACK_REQUEST_TIMEOUT_MS = 5000

interface ColumnSpec {
  title: string
  max: number
  align?: 'left' | 'right'
}

const COLUMN_SPECS: ColumnSpec[] = [
  { title: 'Result', max: 6 },
  { title: 'Kind', max: 18 },
  { title: 'File', max: 34 },
  { title: 'Video ID', max: 16 },
  { title: 'Ed', max: 4 },
  { title: 'Lang', max: 6 },
  { title: 'Error', max: 60 }
]

interface TableRow {
  result: string
  kind: string
  file: string
  videoId: string
  edition: string
  languageId: string
  error: string
}

function truncate(raw: string, max: number): string {
  if (raw.length <= max) {
    return raw
  }

  return `${raw.slice(0, Math.max(0, max - 1))}…`
}

function sanitizeCell(raw: string): string {
  return raw.replace(/\s+/g, ' ').replace(/```/g, "'''").trim()
}

function padCell(
  value: string,
  width: number,
  align: 'left' | 'right' = 'left'
): string {
  if (value.length >= width) {
    return value
  }

  const pad = ' '.repeat(width - value.length)
  return align === 'right' ? `${pad}${value}` : `${value}${pad}`
}

function shortenErrorReason(reason: string): string {
  return reason
    .replace(/^Cannot reach GraphQL endpoint\s+/i, 'Backend unreachable: ')
    .replace(
      /^Validation query rejected by server:\s*/i,
      'Server rejected query: '
    )
    .replace(/^Validation query failed:\s*/i, 'Validation: ')
    .replace(/^Failed validation query:\s*/i, 'Validation: ')
    .replace(/^R2 (create asset|upload):\s*/i, 'R2 $1: ')
    .replace(/^GraphQL \/ Mux enqueue:\s*/i, 'Mux enqueue: ')
    .replace(/^GraphQL subtitle import:\s*/i, 'Subtitle API: ')
    .replace(/^GraphQL audio preview:\s*/i, 'Audio preview API: ')
    .replace(/^Audio metadata \/ ffprobe:\s*/i, 'ffprobe: ')
    .replace(/^Metadata \/ ffprobe:\s*/i, 'ffprobe: ')
    .replace(/^Rename to \.completed:\s*/i, 'Rename on disk: ')
    .replace(/^Unhandled error:\s*/i, '')
}

function displayFileCell(file: string): string {
  const trimmed = file.trim()
  if (trimmed.length === 0) {
    return '(blank)'
  }

  return file.replace(/^\s+/, '·').replace(/\s+$/, '·')
}

function truncateFolderPath(folderPath: string): string {
  if (folderPath.length <= FOLDER_PATH_MAX) {
    return folderPath
  }

  const head = folderPath.slice(0, 40)
  const tail = folderPath.slice(-(FOLDER_PATH_MAX - head.length - 1))
  return `${head}…${tail}`
}

function buildTableRows(summary: ProcessingSummary): TableRow[] {
  const rows: TableRow[] = []

  for (const detail of summary.failureDetails) {
    const r = parseImporterFilenameForTable(detail.file)
    rows.push({
      result: 'FAIL',
      kind: r.kind,
      file: displayFileCell(r.file),
      videoId: r.mediaComponentId,
      edition: r.production === '—' ? '—' : r.production.toLowerCase(),
      languageId: r.languageId,
      error: shortenErrorReason(detail.reason)
    })
  }

  for (const file of summary.successfulFiles) {
    const r = parseImporterFilenameForTable(file)
    rows.push({
      result: 'OK',
      kind: r.kind,
      file: displayFileCell(r.file),
      videoId: r.mediaComponentId,
      edition: r.production === '—' ? '—' : r.production.toLowerCase(),
      languageId: r.languageId,
      error: '—'
    })
  }

  return rows
}

function rowToCells(row: TableRow): string[] {
  return [
    row.result,
    row.kind,
    row.file,
    row.videoId,
    row.edition,
    row.languageId,
    row.error
  ].map(sanitizeCell)
}

function renderAlignedTable(rows: TableRow[]): string {
  const cellRows = rows.map((r) =>
    rowToCells(r).map((c, i) => truncate(c, COLUMN_SPECS[i].max))
  )
  const headerCells = COLUMN_SPECS.map((c) => c.title)

  const widths = COLUMN_SPECS.map((spec, i) => {
    const fromData = cellRows.reduce((m, row) => Math.max(m, row[i].length), 0)
    const fromHeader = headerCells[i].length
    return Math.min(spec.max, Math.max(fromHeader, fromData))
  })

  const renderRow = (cells: string[]): string =>
    cells
      .map((c, i) => padCell(c, widths[i], COLUMN_SPECS[i].align ?? 'left'))
      .join('  ')

  const headerLine = renderRow(headerCells)
  const sepLine = widths.map((w) => '-'.repeat(w)).join('  ')
  const dataLines = cellRows.map(renderRow)

  return [headerLine, sepLine, ...dataLines].join('\n')
}

function buildSummaryLine(params: {
  folderPath: string
  summary: ProcessingSummary
  ranAt: Date
}): string {
  const { folderPath, summary, ranAt } = params
  const dateStr = ranAt.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
  const folderDisplay = truncateFolderPath(folderPath)
  const parts = [
    summary.failed === 0
      ? `:white_check_mark: *All ${summary.total} files succeeded*`
      : `:x: *${summary.failed} failed* · *${summary.successful} ok* of ${summary.total}`,
    `\`${folderDisplay}\``,
    `_${dateStr}_`
  ]

  return parts.join('  ·  ')
}

function pushRunLogTable(blocks: SlackBlock[], rows: TableRow[]): void {
  if (rows.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No file-level rows (nothing matched or processed)._'
      }
    })
    return
  }

  // Paginate rows so each fenced block stays under Slack's section limit.
  const staticOverhead = 12 + '```\n\n```'.length
  let currentStart = 0
  let attempted = rows.length
  let tableSections = 0

  while (currentStart < rows.length && tableSections < MAX_TABLE_SECTIONS) {
    const slice = rows.slice(currentStart, currentStart + attempted)
    const tableText = renderAlignedTable(slice)
    const section = `\`\`\`\n${tableText}\n\`\`\``

    if (
      section.length + staticOverhead <= MRKDWN_SECTION_BUDGET ||
      slice.length === 1
    ) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: section }
      })
      tableSections++
      currentStart += slice.length
      attempted = Math.max(1, rows.length - currentStart)
      continue
    }

    attempted = Math.max(1, Math.floor(slice.length / 2))
  }

  if (currentStart < rows.length) {
    const omitted = rows.length - currentStart
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `_…and *${omitted}* more row${omitted === 1 ? '' : 's'} omitted to stay within Slack's block limit._`
      }
    })
  }
}

function buildNotificationPlainText(params: {
  folderPath: string
  summary: ProcessingSummary
}): string {
  const { folderPath, summary } = params
  const status =
    summary.failed > 0
      ? `${summary.failed} failed · ${summary.successful} ok`
      : `all ${summary.total} ok`

  let tail = ''
  if (summary.failureDetails.length > 0) {
    const first = summary.failureDetails[0]
    const reason = shortenErrorReason(first.reason)
    const r = reason.length > 120 ? `${reason.slice(0, 120)}…` : reason
    tail = ` First error: ${first.file} — ${r}`
    if (summary.failureDetails.length > 1) {
      tail += ` (+${summary.failureDetails.length - 1} more)`
    }
  }

  return `Video Importer: ${status} (${folderPath}).${tail}`
}

function buildSlackBlocks(params: {
  folderPath: string
  summary: ProcessingSummary
}): SlackBlock[] {
  const { folderPath, summary } = params
  const allOk = summary.failed === 0
  const headerPlain = allOk ? 'Video Importer — OK' : 'Video Importer — Issues'
  const ranAt = new Date()
  const summaryLine = buildSummaryLine({ folderPath, summary, ranAt })
  const rows = buildTableRows(summary)

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: headerPlain, emoji: true }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: summaryLine }
    }
  ]

  pushRunLogTable(blocks, rows)

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text:
          '_*OK* = R2 upload + backend GraphQL step completed (e.g. Mux enqueued). ' +
          'Mux encoding / “ready to stream” is async; check the admin UI for playback state._'
      }
    ]
  })

  return blocks
}

function resolveSlackCredentials(): {
  token: string
  channelId: string
} | null {
  const token =
    typeof process.env.SLACK_BOT_TOKEN === 'string'
      ? process.env.SLACK_BOT_TOKEN.trim()
      : ''
  const channelId =
    typeof process.env.SLACK_CHANNEL_ID === 'string'
      ? process.env.SLACK_CHANNEL_ID.trim()
      : ''

  if (token.length === 0 && channelId.length === 0) {
    return null
  }

  if (token.length === 0 || channelId.length === 0) {
    console.warn(
      '[video-importer] Slack is partially configured: set both SLACK_BOT_TOKEN and SLACK_CHANNEL_ID to enable notifications.'
    )
    return null
  }

  return { token, channelId }
}

export async function postVideoImporterSlackSummary(params: {
  folderPath: string
  summary: ProcessingSummary
}): Promise<boolean> {
  const credentials = resolveSlackCredentials()
  if (credentials === null) {
    return false
  }

  const { token, channelId } = credentials

  const text = buildNotificationPlainText(params)
  const blocks = buildSlackBlocks(params)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SLACK_REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(SLACK_CHAT_POST_MESSAGE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        channel: channelId,
        text,
        blocks
      }),
      signal: controller.signal
    })
  } catch (err) {
    if ((err as { name?: string }).name === 'AbortError') {
      console.error(
        `[video-importer] Slack API request timed out after ${SLACK_REQUEST_TIMEOUT_MS}ms`
      )
    } else {
      console.error('[video-importer] Failed to reach Slack API:', err)
    }
    return false
  } finally {
    clearTimeout(timeout)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    console.error('[video-importer] Slack returned a non-JSON response')
    return false
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('ok' in body) ||
    (body as { ok: unknown }).ok !== true
  ) {
    const error =
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof (body as { error: unknown }).error === 'string'
        ? (body as { error: string }).error
        : 'unknown_error'
    console.error(`[video-importer] Slack chat.postMessage failed: ${error}`)
    return false
  }

  return true
}
