import { Logger } from 'pino'

import { slackChatPostMessage } from './slack/chatPostMessage'
import {
  type SlackBotChannelConfig,
  getMediaDataLangSlackConfig
} from './slack/config'
import { type ReportRow, formatDateIso } from './videoSlackReport'
/**
 * Slack `section` mrkdwn text must stay under 3000 chars, so large reports
 * intentionally split into month-part messages with repeated headers.
 */
const tableFenceSoftLimit = 2900
const maxBlocksPerMessage = 40
const baseBlocksPerMessage = 5
const maxTableChunksPerMessage = maxBlocksPerMessage - baseBlocksPerMessage
const postDelayMs = 450

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

function getMonthKey(value: Date): string {
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(
    2,
    '0'
  )}`
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

interface MonthGroup {
  key: string
  label: string
  rows: ReportRow[]
}

function groupRowsByMonth(rows: ReportRow[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>()

  for (const row of rows) {
    const key = getMonthKey(row.changeDate)
    const existing = groups.get(key)
    if (existing != null) {
      existing.rows.push(row)
      continue
    }
    groups.set(key, {
      key,
      label: formatMonthYearUtc(row.changeDate),
      rows: [row]
    })
  }

  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key))
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
    blocks
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

  const windowText = `${formatDateIso(startDate)} → ${formatDateIso(endDate)}`
  await postSlackMessage({
    config,
    text: `Weekly production report · no videos activated · ${windowText}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*No videos were activated this week*\n\`${windowText}\``
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

  const windowText = `${formatDateIso(startDate)} → ${formatDateIso(endDate)}`
  const newUploads = rows.filter(
    (row) => row.changeType === 'New Upload'
  ).length
  const updates = rows.filter((row) => row.changeType === 'Update').length
  const variantUpdates = rows.filter(
    (row) => row.updateSource === 'Variant Updated'
  ).length
  const metadataUpdates = rows.filter(
    (row) => row.updateSource === 'Video Metadata'
  ).length

  const monthGroups = groupRowsByMonth(rows)
  const chunkedMonthGroups = monthGroups.map((group) => ({
    ...group,
    tableChunks: chunkDataRowsForFence(
      group.rows.map(buildTableDataLine),
      tableFenceSoftLimit
    )
  }))
  const monthMessageGroups = chunkedMonthGroups.map((group) => ({
    ...group,
    tableChunkGroups: chunkTableChunksForMessage(group.tableChunks)
  }))
  const totalMessageCount = monthMessageGroups.reduce(
    (count, group) => count + Math.max(group.tableChunkGroups.length, 1),
    0
  )

  for (
    let groupIndex = 0;
    groupIndex < monthMessageGroups.length;
    groupIndex++
  ) {
    const group = monthMessageGroups[groupIndex]
    const tableChunkGroups =
      group.tableChunkGroups.length > 0
        ? group.tableChunkGroups
        : [[[] as string[]]]

    for (let partIndex = 0; partIndex < tableChunkGroups.length; partIndex++) {
      if (groupIndex > 0 || partIndex > 0) {
        await sleep(postDelayMs)
      }

      const tableChunks = tableChunkGroups[partIndex]
      const partText =
        tableChunkGroups.length > 1 ? ` part ${partIndex + 1}` : ''
      const title = `Production · ${group.label}${partText}`
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
              text: `*Reporting window (UTC)*\n\`${windowText}\``
            },
            {
              type: 'mrkdwn',
              text: `*Row counts*\nNew Upload rows: *${newUploads}*\nUpdate rows: *${updates}* (variant: *${variantUpdates}*, metadata: *${metadataUpdates}*)\nTotal lines: *${rows.length}*`
            },
            {
              type: 'mrkdwn',
              text: `*Month rows*\n${group.label}: *${group.rows.length}* row(s)${
                tableChunkGroups.length > 1
                  ? ` · part *${partIndex + 1}/${tableChunkGroups.length}*`
                  : ''
              }`
            },
            {
              type: 'mrkdwn',
              text:
                totalMessageCount > 1
                  ? `*Delivery*\n${totalMessageCount} month-grouped messages.`
                  : `*Delivery*\nSingle message.`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Scope*\nVideos with label \`collection\` are excluded. *Update* rows come from \`VideoVariant.updatedAt\` (per language) **or** \`Video.updatedAt\` when the video changed but no variant row is listed (primary language, de-duped). *New Upload* = one row per new video.`
          }
        },
        { type: 'divider' },
        ...tableChunks.map((chunk) => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              chunk.length === 0
                ? '_No table rows after filters._'
                : fenceTableLines([
                    buildTableHeaderLine(),
                    buildTableSeparatorLine(),
                    ...chunk
                  ])
          }
        })),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'api-media · `collection` excluded · language names: English gloss (`529`) · `Total` = translated package size for `series` / `featureFilm`, otherwise `1`'
            }
          ]
        }
      ]

      const ts = await postSlackMessage({
        config,
        text: `Weekly production report · ${group.label}${partText} · ${group.rows.length} row(s)`,
        blocks,
        childLogger
      })
      if (ts == null) {
        return
      }
    }
  }
}
