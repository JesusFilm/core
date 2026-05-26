import { Logger } from 'pino'

import { slackChatPostMessage } from '../slack/chatPostMessage'

import {
  type VideoSlackReportProfile,
  dataLangVideoSlackProfile
} from './videoSlackProfiles'
import { type ReportRow } from './videoSlackReport'

const postDelayMs = 1100
const oneDayMs = 24 * 60 * 60 * 1000
const dailyWindowToleranceMs = 60 * 1000
const slackTableMaxRows = 100
const slackTableHeaderRows = 1
const slackTableDataRowsPerMessage = slackTableMaxRows - slackTableHeaderRows

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
  return month + ' ' + day + ordinalSuffix(day) + ', ' + year
}

function formatShortDateUtc(value: Date): string {
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')
  const year = String(value.getUTCFullYear() % 100).padStart(2, '0')
  return month + '/' + day + '/' + year
}

function formatReportWindowUtc(args: { startDate: Date; endDate: Date }): {
  label: string
  value: string
} {
  const { startDate, endDate } = args
  const durationMs = endDate.getTime() - startDate.getTime()
  if (Math.abs(durationMs - oneDayMs) <= dailyWindowToleranceMs) {
    return {
      label: 'Report date',
      value: formatLongDateUtc(endDate)
    }
  }

  return {
    label: 'Window',
    value: formatLongDateUtc(startDate) + ' → ' + formatLongDateUtc(endDate)
  }
}

function sanitizeCell(value: string): string {
  return value.replace(/[\n\r|]/g, ' ').trim()
}

function truncateEnd(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }
  return value.slice(0, Math.max(0, maxLength - 1)) + '…'
}

function formatTotal(row: ReportRow): string {
  if (row.total < row.packageSize) {
    return row.total + ' / ' + row.packageSize + ' ⚠'
  }
  return String(row.total)
}

function rawTextCell(text: string): unknown {
  return { type: 'raw_text', text: sanitizeCell(text) }
}

function richLinkCell(label: string, url: string | undefined): unknown {
  if (url == null || url === '') {
    return rawTextCell('-')
  }

  return {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [{ type: 'link', text: label, url }]
      }
    ]
  }
}

function buildSlackTableHeaderRow(): unknown[] {
  return [
    rawTextCell('Production'),
    rawTextCell('Media Component ID'),
    rawTextCell('Language'),
    rawTextCell('Version'),
    rawTextCell('Date'),
    rawTextCell('Total'),
    rawTextCell('Watch'),
    rawTextCell('Nexus')
  ]
}

function buildSlackTableDataRow(row: ReportRow): unknown[] {
  return [
    rawTextCell(row.production),
    rawTextCell(row.mediaComponentId),
    rawTextCell(row.languageName + ' (' + row.languageId + ')'),
    rawTextCell(String(row.version)),
    rawTextCell(formatShortDateUtc(row.changeDate)),
    rawTextCell(formatTotal(row)),
    richLinkCell('Watch', row.watchUrl),
    richLinkCell('Nexus', row.nexusUrl)
  ]
}

function buildSlackTableBlock(rows: ReportRow[]): unknown {
  return {
    type: 'table',
    column_settings: [
      { is_wrapped: true },
      { is_wrapped: true },
      { is_wrapped: true },
      { align: 'right' },
      { align: 'left' },
      { align: 'left' },
      { align: 'left' },
      { align: 'left' }
    ],
    rows: [buildSlackTableHeaderRow(), ...rows.map(buildSlackTableDataRow)]
  }
}

function chunkRowsForSlackTable(rows: ReportRow[]): ReportRow[][] {
  const chunks: ReportRow[][] = []
  for (
    let index = 0;
    index < rows.length;
    index += slackTableDataRowsPerMessage
  ) {
    chunks.push(rows.slice(index, index + slackTableDataRowsPerMessage))
  }
  return chunks
}

async function postSlackMessage(args: {
  profile: VideoSlackReportProfile
  text: string
  blocks: unknown[]
  childLogger: Logger
}): Promise<string | undefined> {
  const { profile, text, blocks, childLogger } = args
  const config = profile.getSlackConfig(childLogger)
  if (config == null) {
    return undefined
  }

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
    failureMessage: profile.title + ' Slack summary failed',
    errorMessage: profile.title + ' Slack summary threw an error'
  })
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function postLinkedTableVideoSlackMessages(args: {
  profile: VideoSlackReportProfile
  rows: ReportRow[]
  startDate: Date
  endDate: Date
  childLogger: Logger
}): Promise<void> {
  const { profile, rows, startDate, endDate, childLogger } = args
  const reportWindow = formatReportWindowUtc({ startDate, endDate })
  const newRows = rows.filter((row) => row.changeType === 'New')
  const updateRows = rows.filter((row) => row.changeType === 'Update')
  const groups: Array<{ label: string; rows: ReportRow[] }> = []
  if (newRows.length > 0) {
    groups.push({ label: 'New videos', rows: newRows })
  }
  if (updateRows.length > 0) {
    groups.push({ label: 'Updates (new audio language)', rows: updateRows })
  }

  const tableChunks: Array<{ label: string; rows: ReportRow[] }> = []
  for (const group of groups) {
    for (const chunk of chunkRowsForSlackTable(group.rows)) {
      tableChunks.push({ label: group.label, rows: chunk })
    }
  }

  for (let partIndex = 0; partIndex < tableChunks.length; partIndex++) {
    if (partIndex > 0) {
      await sleep(postDelayMs)
    }

    const tableChunk = tableChunks[partIndex]
    const partText = tableChunks.length > 1 ? ' part ' + (partIndex + 1) : ''
    const title = profile.title + partText
    const isLastPart = partIndex === tableChunks.length - 1

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
            text: '*' + reportWindow.label + '*\n' + reportWindow.value
          },
          {
            type: 'mrkdwn',
            text: '*Total*\n' + rows.length + ' videos updated'
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*About this report*\nEach row is a published video with content created or updated during the reporting window. *Total* shows how many videos in a series were updated. ⚠ means the series is not fully translated yet. Use *Watch* to verify the public page and *Nexus* to inspect the media record.'
        }
      },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*' + tableChunk.label + '*' }
      },
      buildSlackTableBlock(tableChunk.rows)
    ]

    if (isLastPart && profile.footerText !== '') {
      blocks.push(
        { type: 'divider' },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: profile.footerText
          }
        }
      )
    }

    const ts = await postSlackMessage({
      profile,
      text: profile.title + partText + ' · ' + rows.length + ' videos updated',
      blocks,
      childLogger
    })
    if (ts == null) {
      return
    }
  }
}

export async function postVideoSlackMessages(args: {
  profile: VideoSlackReportProfile
  rows: ReportRow[]
  startDate: Date
  endDate: Date
  childLogger: Logger
}): Promise<void> {
  await postLinkedTableVideoSlackMessages(args)
}

export async function postDataLangVideoSlackMessages(args: {
  rows: ReportRow[]
  startDate: Date
  endDate: Date
  childLogger: Logger
}): Promise<void> {
  await postVideoSlackMessages({ ...args, profile: dataLangVideoSlackProfile })
}
