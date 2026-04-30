import { Logger } from 'pino'

import { slackChatPostMessage } from './slack/chatPostMessage'
import {
  type SlackBotChannelConfig,
  getMediaDataLangSlackConfig
} from './slack/config'
import { type ReportRow } from './videoSlackReport'
/**
 * Slack `section` mrkdwn text must stay under 3000 chars, so large reports
 * are split across multiple messages with repeated headers.
 */
const tableFenceSoftLimit = 2900
const maxBlocksPerMessage = 40
const baseBlocksPerMessage = 5
const maxTableChunksPerMessage = maxBlocksPerMessage - baseBlocksPerMessage
const postDelayMs = 450

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th'
  }
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

function formatLongDateUtc(value: Date): string {
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
  const month = months[value.getUTCMonth()]
  const day = value.getUTCDate()
  const year = value.getUTCFullYear()
  return `${month} ${day}${ordinalSuffix(day)}, ${year}`
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
  languageId: 12,
  language: 24,
  changeType: 18,
  date: 20,
  total: 12
} as const

function formatTotal(row: ReportRow): string {
  if (row.total < row.packageSize) {
    return `${row.total} / ${row.packageSize} ⚠`
  }
  return String(row.total)
}

function buildTableHeaderLine(): string {
  return [
    padCell('Production', col.production),
    padCell('Media Component ID', col.mediaId),
    padCell('Language ID', col.languageId),
    padCell('Language Name', col.language),
    padCell('Change Type', col.changeType),
    padCell('Date', col.date),
    padCell('Total', col.total)
  ].join(' | ')
}

function buildTableSeparatorLine(): string {
  return [
    '-'.repeat(col.production),
    '-'.repeat(col.mediaId),
    '-'.repeat(col.languageId),
    '-'.repeat(col.language),
    '-'.repeat(col.changeType),
    '-'.repeat(col.date),
    '-'.repeat(col.total)
  ].join('-|-')
}

function buildTableDataLine(row: ReportRow): string {
  return [
    padCell(row.production, col.production),
    padCell(row.mediaComponentId, col.mediaId),
    padCell(row.languageId, col.languageId),
    padCell(row.languageName, col.language),
    padCell(row.changeType, col.changeType),
    padCell(formatLongDateUtc(row.changeDate), col.date),
    padCell(formatTotal(row), col.total)
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

function chunkTableChunksForMessage(tableChunks: string[][]): string[][][] {
  const chunks: string[][][] = []
  for (
    let index = 0;
    index < tableChunks.length;
    index += maxTableChunksPerMessage
  ) {
    chunks.push(tableChunks.slice(index, index + maxTableChunksPerMessage))
  }
  return chunks
}

async function postSlackMessage(args: {
  config: SlackBotChannelConfig
  text: string
  blocks: unknown[]
  childLogger: Logger
}): Promise<string | undefined> {
  const { config, text, blocks, childLogger } = args

  const body: Record<string, unknown> = {
    text,
    blocks,
    unfurl_links: false,
    unfurl_media: false
  }

  return slackChatPostMessage({
    config,
    body,
    log: childLogger,
    failureMessage: 'Weekly video Slack summary failed',
    errorMessage: 'Weekly video Slack summary threw an error'
  })
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function postEmptyWeeklyVideoSlackMessage(args: {
  startDate: Date
  endDate: Date
  childLogger: Logger
}): Promise<void> {
  const { startDate, endDate, childLogger } = args
  const config = getMediaDataLangSlackConfig(childLogger)
  if (config == null) {
    return
  }

  const windowText = `${formatLongDateUtc(startDate)} → ${formatLongDateUtc(endDate)}`
  await postSlackMessage({
    config,
    text: `Weekly Video Report · no new videos · ${windowText}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*No new videos this week*\n${windowText}`
        }
      }
    ],
    childLogger
  })
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

  const windowText = `${formatLongDateUtc(startDate)} → ${formatLongDateUtc(endDate)}`

  const tableChunks = chunkDataRowsForFence(
    rows.map(buildTableDataLine),
    tableFenceSoftLimit
  )
  const tableChunkGroups = chunkTableChunksForMessage(tableChunks)
  const messageGroups =
    tableChunkGroups.length > 0 ? tableChunkGroups : [[[] as string[]]]

  for (let partIndex = 0; partIndex < messageGroups.length; partIndex++) {
    if (partIndex > 0) {
      await sleep(postDelayMs)
    }

    const messageChunks = messageGroups[partIndex]
    const partText = messageGroups.length > 1 ? ` part ${partIndex + 1}` : ''
    const title = `Weekly Video Report${partText}`

    const blocks: unknown[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: truncateEnd(title, 150)
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Week*\n${windowText}`
          },
          {
            type: 'mrkdwn',
            text: `*Total*\n${rows.length} videos updated`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*About this report*\nEach row is a video that got new content this week. *Total* shows how many videos in a series were updated. ⚠ means the series isn’t fully translated yet.'
        }
      },
      { type: 'divider' },
      ...messageChunks.map((chunk) => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            chunk.length === 0
              ? '_No videos this week._'
              : fenceTableLines([
                  buildTableHeaderLine(),
                  buildTableSeparatorLine(),
                  ...chunk
                ])
        }
      }))
    ]

    const ts = await postSlackMessage({
      config,
      text: `Weekly Video Report${partText} · ${rows.length} videos updated`,
      blocks,
      childLogger
    })
    if (ts == null) {
      return
    }
  }
}
