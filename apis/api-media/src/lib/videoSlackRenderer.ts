import { Logger } from 'pino'

import {
  formatDateIso,
  ReportRow
} from './videoSlackReport'
import { slackChatPostMessage } from './slack/chatPostMessage'
import { getMediaDataLangSlackConfig, type SlackBotChannelConfig } from './slack/config'
/**
 * Slack `section` mrkdwn text must stay under 3000 chars, so large reports
 * intentionally continue in thread replies with repeated headers.
 */
const tableFenceSoftLimit = 2650
const threadPostDelayMs = 450

function formatShortMonthDay(value: Date): string {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  return `${months[value.getUTCMonth()]} ${value.getUTCDate()}`
}

function formatMonthYearUtc(value: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  return `${months[value.getUTCMonth()]} ${value.getUTCFullYear()} (UTC)`
}

function sanitizeCell(value: string): string {
  return value.replace(/[\n\r|]/g, ' ').trim()
}

function truncateEnd(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`
}

function padCell(value: string, width: number): string {
  return truncateEnd(sanitizeCell(value), width).padEnd(width, ' ')
}

const col = {
  production: 32,
  mediaId: 24,
  language: 24,
  changeType: 12,
  updateSource: 16,
  date: 8,
  total: 6
} as const

function buildTableHeaderLine(): string {
  return [
    padCell('Production', col.production),
    padCell('Media Component ID', col.mediaId),
    padCell('Language Name', col.language),
    padCell('Change Type', col.changeType),
    padCell('Update Source', col.updateSource),
    padCell('Date', col.date),
    padCell('Total', col.total)
  ].join(' | ')
}

function buildTableSeparatorLine(): string {
  return [
    '-'.repeat(col.production),
    '-'.repeat(col.mediaId),
    '-'.repeat(col.language),
    '-'.repeat(col.changeType),
    '-'.repeat(col.updateSource),
    '-'.repeat(col.date),
    '-'.repeat(col.total)
  ].join('-|-')
}

function buildTableDataLine(row: ReportRow): string {
  return [
    padCell(row.production, col.production),
    padCell(row.mediaComponentId, col.mediaId),
    padCell(row.languageName, col.language),
    padCell(row.changeType, col.changeType),
    padCell(row.updateSource, col.updateSource),
    padCell(formatShortMonthDay(row.changeDate), col.date),
    padCell(String(row.total), col.total)
  ].join(' | ')
}

function chunkDataRowsForFence(
  dataLines: string[],
  maxInnerChars: number
): string[][] {
  const headerBlock =
    buildTableHeaderLine() + '\n' + buildTableSeparatorLine() + '\n'
  const headerLen = headerBlock.length
  const chunks: string[][] = []
  let current: string[] = []
  let used = headerLen

  const flush = (): void => {
    if (current.length === 0) {
      return
    }
    chunks.push(current)
    current = []
    used = headerLen
  }

  for (const line of dataLines) {
    const add = line.length + (current.length > 0 ? 1 : 0)
    if (used + add > maxInnerChars && current.length > 0) {
      flush()
    }
    if (line.length + headerLen > maxInnerChars) {
      current.push(truncateEnd(line, maxInnerChars - headerLen - 2))
      flush()
      continue
    }
    current.push(line)
    used += add
  }
  flush()
  return chunks
}

function fenceTableLines(lines: string[]): string {
  return ['```', ...lines, '```'].join('\n')
}

async function postSlackMessage(args: {
  config: SlackBotChannelConfig
  text: string
  blocks: unknown[]
  threadTs?: string
  childLogger: Logger
}): Promise<string | undefined> {
  const { config, text, blocks, threadTs, childLogger } = args

  const body: Record<string, unknown> = {
    text,
    blocks
  }
  if (threadTs != null) {
    body.thread_ts = threadTs
  }

  return slackChatPostMessage({
    config,
    body,
    log: childLogger,
    failureMessage:
      threadTs != null
        ? 'Weekly video Slack summary thread reply failed'
        : 'Weekly video Slack summary failed',
    errorMessage:
      threadTs != null
        ? 'Weekly video Slack summary thread reply threw an error'
        : 'Weekly video Slack summary threw an error'
  })
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function postWeeklyVideoSlackMessages(args: {
  rows: ReportRow[]
  startDate: Date
  endDate: Date
  childLogger: Logger
}): Promise<void> {
  const { rows, startDate, endDate, childLogger } = args
  const config = getMediaDataLangSlackConfig(childLogger)
  if (config == null) {
    return
  }

  const windowText = `${formatDateIso(startDate)} → ${formatDateIso(endDate)}`
  const newUploads = rows.filter((row) => row.changeType === 'New Upload').length
  const updates = rows.filter((row) => row.changeType === 'Update').length
  const variantUpdates = rows.filter(
    (row) => row.updateSource === 'Variant Updated'
  ).length
  const metadataUpdates = rows.filter(
    (row) => row.updateSource === 'Video Metadata'
  ).length

  const dataLines = rows.map(buildTableDataLine)
  const tableChunks = chunkDataRowsForFence(dataLines, tableFenceSoftLimit)

  const summaryBlocks: unknown[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: truncateEnd(`Production · ${formatMonthYearUtc(endDate)}`, 150)
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Reporting window (UTC)*\n\`${windowText}\``
        },
        {
          type: 'mrkdwn',
          text: `*Row counts*\nNew Upload rows: *${newUploads}*\nUpdate rows: *${updates}* (variant: *${variantUpdates}*, metadata: *${metadataUpdates}*)\nTotal lines: *${rows.length}*`
        },
        {
          type: 'mrkdwn',
          text: `*Scope*\nVideos with label \`collection\` are excluded. *Update* rows come from \`VideoVariant.updatedAt\` (per language) **or** \`Video.updatedAt\` when the video changed but no variant row is listed (primary language, de-duped). *New Upload* = one row per new video.`
        },
        {
          type: 'mrkdwn',
          text:
            tableChunks.length > 1
              ? `*Delivery*\n${tableChunks.length} messages in *this thread* (Slack size limits).`
              : `*Delivery*\nSingle message.`
        }
      ]
    },
    { type: 'divider' }
  ]

  if (tableChunks.length === 0) {
    summaryBlocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '_No table rows after filters._'
      }
    })
  } else {
    summaryBlocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: fenceTableLines([
          buildTableHeaderLine(),
          buildTableSeparatorLine(),
          ...tableChunks[0]
        ])
      }
    })
  }

  summaryBlocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: 'api-media · `collection` excluded · language names: English gloss (`529`) · `Total` = translated package size for `series` / `featureFilm`, otherwise `1`'
      }
    ]
  })

  const rootTs = await postSlackMessage({
    config,
    text: `Weekly production report · ${rows.length} row(s) · ${formatMonthYearUtc(endDate)}`,
    blocks: summaryBlocks,
    childLogger
  })

  if (rootTs == null) {
    return
  }

  for (let index = 1; index < tableChunks.length; index++) {
    await sleep(threadPostDelayMs)
    const threadTs = await postSlackMessage({
      config,
      text: `Weekly production report (continued ${index + 1}/${tableChunks.length})`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: fenceTableLines([
              buildTableHeaderLine(),
              buildTableSeparatorLine(),
              ...tableChunks[index]
            ])
          }
        }
      ],
      threadTs: rootTs,
      childLogger
    })
    if (threadTs == null) {
      break
    }
  }
}
