import { Logger } from 'pino'

import { slackChatPostMessage } from './slack/chatPostMessage'
import { getMediaDataLangSlackConfig } from './slack/config'
import { type BulkVideoReportRow } from './videoSlackBulkReport'
import { formatDateIso } from './videoSlackReport'

const maxBlocksPerMessage = 40
const baseBlocksPerMessage = 3
const maxVideoBlocksPerMessage = maxBlocksPerMessage - baseBlocksPerMessage
const maxLanguagesShownPerVideo = 3
const tableFenceSoftLimit = 2850
const postDelayMs = 450

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

function truncateEnd(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`
}

function padCell(value: string, width: number): string {
  return truncateEnd(value.replace(/[\n\r|]/g, ' ').trim(), width).padEnd(
    width,
    ' '
  )
}

function sanitizeMrkdwn(value: string): string {
  return value.replace(/[<&>]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      default:
        return '&amp;'
    }
  })
}

const tableCol = {
  video: 32,
  mediaId: 24,
  isNew: 7,
  created: 10,
  names: 32,
  ids: 26
} as const

function buildTableHeaderLine(): string {
  return [
    padCell('Video', tableCol.video),
    padCell('Media Component ID', tableCol.mediaId),
    padCell('Is New?', tableCol.isNew),
    padCell('Created', tableCol.created),
    padCell('Language Names', tableCol.names),
    padCell('Language IDs', tableCol.ids)
  ].join(' | ')
}

function buildTableSeparatorLine(): string {
  return [
    '-'.repeat(tableCol.video),
    '-'.repeat(tableCol.mediaId),
    '-'.repeat(tableCol.isNew),
    '-'.repeat(tableCol.created),
    '-'.repeat(tableCol.names),
    '-'.repeat(tableCol.ids)
  ].join('-|-')
}

function formatInlineLanguageList(values: string[]): string {
  const shownCount =
    values.length > maxLanguagesShownPerVideo ? 1 : maxLanguagesShownPerVideo
  const shown = values.slice(0, shownCount)
  const remaining = values.length - shown.length
  return [
    ...shown.map(sanitizeMrkdwn),
    ...(remaining > 0 ? [`+${remaining} more`] : [])
  ].join(', ')
}

function buildTableDataLine(row: BulkVideoReportRow): string {
  return [
    padCell(row.production, tableCol.video),
    padCell(row.mediaComponentId, tableCol.mediaId),
    padCell(row.isNew ? 'Yes' : 'No', tableCol.isNew),
    padCell(formatDateIso(row.createdDate), tableCol.created),
    padCell(formatInlineLanguageList(row.languageNames), tableCol.names),
    padCell(formatInlineLanguageList(row.languageIds), tableCol.ids)
  ].join(' | ')
}

function chunkRowsForTable(rows: BulkVideoReportRow[]): BulkVideoReportRow[][] {
  const headerBlock =
    buildTableHeaderLine() + '\n' + buildTableSeparatorLine() + '\n'
  const chunks: BulkVideoReportRow[][] = []
  let current: BulkVideoReportRow[] = []
  let used = headerBlock.length

  const flush = (): void => {
    if (current.length === 0) {
      return
    }
    chunks.push(current)
    current = []
    used = headerBlock.length
  }

  for (const row of rows) {
    const line = buildTableDataLine(row)
    const add = line.length + (current.length > 0 ? 1 : 0)
    if (
      current.length > 0 &&
      (current.length >= maxVideoBlocksPerMessage ||
        used + add > tableFenceSoftLimit)
    ) {
      flush()
    }
    current.push(row)
    used += add
  }
  flush()

  return chunks
}

function groupRowsByMonth(rows: BulkVideoReportRow[]): Array<{
  key: string
  label: string
  rows: BulkVideoReportRow[]
}> {
  const groups = new Map<
    string,
    { key: string; label: string; rows: BulkVideoReportRow[] }
  >()

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

function buildTableBlock(rows: BulkVideoReportRow[]): unknown {
  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: [
        '```',
        buildTableHeaderLine(),
        buildTableSeparatorLine(),
        ...rows.map(buildTableDataLine),
        '```'
      ].join('\n')
    }
  }
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function postBulkVideoSlackMessages(args: {
  rows: BulkVideoReportRow[]
  startDate: Date
  endDate: Date
  childLogger: Logger
}): Promise<void> {
  const { rows, startDate, endDate, childLogger } = args
  const config = getMediaDataLangSlackConfig(childLogger)
  if (config == null) {
    return
  }

  const groups = groupRowsByMonth(rows).map((group) => ({
    ...group,
    rowChunks: chunkRowsForTable(group.rows)
  }))
  const totalMessageCount = groups.reduce(
    (count, group) => count + Math.max(group.rowChunks.length, 1),
    0
  )
  const windowText = `${formatDateIso(startDate)} → ${formatDateIso(endDate)}`

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex]
    const rowChunks =
      group.rowChunks.length > 0 ? group.rowChunks : [[] as BulkVideoReportRow[]]

    for (let partIndex = 0; partIndex < rowChunks.length; partIndex++) {
      if (groupIndex > 0 || partIndex > 0) {
        await sleep(postDelayMs)
      }

      const partText = rowChunks.length > 1 ? ` part ${partIndex + 1}` : ''
      const title = `Bulk Production · ${group.label}${partText}`
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
              text: `*Videos in this month*\n${group.rows.length} video(s)${
                rowChunks.length > 1
                  ? ` · part *${partIndex + 1}/${rowChunks.length}*`
                  : ''
              }`
            },
            {
              type: 'mrkdwn',
              text:
                totalMessageCount > 1
                  ? `*Delivery*\n${totalMessageCount} bulk messages.`
                  : '*Delivery*\nSingle message.'
            }
          ]
        },
        { type: 'divider' },
        buildTableBlock(rowChunks[partIndex])
      ]

      const ts = await slackChatPostMessage({
        config,
        body: {
          text: `Bulk weekly production report · ${group.label}${partText} · ${group.rows.length} video(s)`,
          blocks
        },
        log: childLogger,
        failureMessage: 'Bulk video Slack summary failed',
        errorMessage: 'Bulk video Slack summary threw an error'
      })

      if (ts == null) {
        return
      }
    }
  }
}
